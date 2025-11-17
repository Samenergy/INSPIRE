"""
RAG-based Analysis Service
Retrieval-Augmented Generation for Company Intelligence Extraction

Extracts 10 categories:
1. Latest Updates
2. Challenges
3. Decision Makers
4. Market Position
5. Future Plans
6. Action Plan (SME engagement steps)
7. Solution (SME solutions for client needs)
8. Company Info (5-sentence description)
9. Strengths (competitive advantages)
10. Opportunities (growth areas)
"""

import json
import re
import copy
import hashlib
import numpy as np
import requests
from typing import List, Dict, Any, Optional, Callable
from datetime import datetime
from collections import OrderedDict
from loguru import logger
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


def _patch_marshmallow():
    """Ensure marshmallow exposes compatibility attributes for environs/pymilvus."""
    try:
        import marshmallow as ma  # type: ignore
    except ImportError:
        return None

    if not hasattr(ma, "__version_info__"):
        try:
            version_tuple = tuple(int(part) for part in ma.__version__.split(".") if part.isdigit())
        except Exception:
            version_tuple = (0, 0, 0)
        ma.__version_info__ = version_tuple  # type: ignore[attr-defined]

    if not hasattr(ma.fields.Field, "__orig_init__"):
        original_init = ma.fields.Field.__init__

        def _field_init_with_missing(self, *args, **kwargs):
            if "missing" in kwargs and "load_default" not in kwargs:
                kwargs["load_default"] = kwargs.pop("missing")
            return original_init(self, *args, **kwargs)

        ma.fields.Field.__orig_init__ = original_init  # type: ignore[attr-defined]
        ma.fields.Field.__init__ = _field_init_with_missing  # type: ignore[assignment]

    if not hasattr(ma.fields.Field, "missing"):
        def _get_missing(self):
            return getattr(self, "load_default", None)

        def _set_missing(self, value):
            setattr(self, "load_default", value)

        ma.fields.Field.missing = property(_get_missing, _set_missing)  # type: ignore[attr-defined]

    return ma


_patched_marshmallow = _patch_marshmallow()

# Milvus (optional, with in-memory fallback)
try:
    from pymilvus import connections, Collection, FieldSchema, CollectionSchema, DataType, utility
    MILVUS_AVAILABLE = True
except ImportError:
    connections = Collection = FieldSchema = CollectionSchema = DataType = utility = None  # type: ignore
    MILVUS_AVAILABLE = False
    logger.warning("pymilvus not available, using in-memory vector storage")


class RAGAnalysisService:
    """
    RAG-based Company Analysis Service
    
    Architecture:
    1. Text Chunking (split articles into semantic chunks)
    2. Embedding (SentenceTransformer)
    3. Vector Storage (Milvus or in-memory)
    4. Retrieval (cosine similarity)
    5. Generation (Llama-3 via Ollama)
    6. JSON Parsing & Validation
    """
    
    def __init__(
        self,
        milvus_host: str = "localhost",
        milvus_port: str = "19530",
        ollama_host: str = "http://localhost:11434",
        llm_model: str = "llama3.1:latest"
    ):
        """Initialize RAG service"""
        logger.info("🚀 Initializing RAG Analysis Service...")
        
        # Configuration
        self.milvus_host = milvus_host
        self.milvus_port = milvus_port
        
        # Normalize Ollama URL - ensure it has protocol and proper format
        self.ollama_host = ollama_host.rstrip('/')
        if not self.ollama_host.startswith(('http://', 'https://')):
            # If no protocol, assume http://
            self.ollama_host = f'http://{self.ollama_host}'
        
        self.llm_model = llm_model
        
        # Hyperparameters
        self.hyperparameters = {
            'chunk_size': 500,
            'chunk_overlap': 100,
            'top_k': 5,
            'temperature': 0.3,
            'max_tokens': 1000,
            'similarity_threshold': 0.1  # Lowered from 0.2 to allow more chunks through
        }
        
        # Initialize embedding model - FORCE CPU to prevent MPS/SIGSEGV crashes
        logger.info("📦 Loading SentenceTransformer model (CPU-only)...")
        import torch
        device = 'cpu'  # Always use CPU to prevent SIGSEGV crashes
        self.embedding_model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2', device=device)
        self.embedding_dim = self.embedding_model.get_sentence_embedding_dimension()
        logger.info(f"✅ Embedding model loaded (dim={self.embedding_dim}, device={device})")
        
        # Initialize Milvus or in-memory storage
        self.milvus_available = False
        self.collection = None
        self.in_memory_chunks = []
        self.in_memory_embeddings = None
        self.analysis_cache: "OrderedDict[tuple, Dict[str, Any]]" = OrderedDict()
        self.vector_cache: "OrderedDict[str, Dict[str, Any]]" = OrderedDict()
        self.cache_max_entries = 10
        self.vector_cache_max_entries = 5
        
        if MILVUS_AVAILABLE:
            try:
                connections.connect(
                    alias="default",
                    host=milvus_host,
                    port=milvus_port,
                    timeout=5
                )
                self.milvus_available = True
                logger.info(f"✅ Connected to Milvus at {milvus_host}:{milvus_port}")
            except Exception as e:
                logger.warning(f"⚠️ Milvus connection failed: {e}. Using in-memory storage.")
        else:
            logger.info("📝 Using in-memory vector storage (Milvus not available)")
        
        logger.info("✅ RAG Analysis Service initialized")
    
    def _generate_articles_signature(self, articles: List[Dict[str, str]]) -> str:
        """Generate deterministic signature for a list of articles"""
        hasher = hashlib.sha256()
        for article in sorted(articles, key=lambda a: (a.get('title', '') or '') + (a.get('content', '') or '')):
            title = (article.get('title') or '').strip().lower()
            content = (article.get('content') or '').strip().lower()
            hasher.update(title.encode('utf-8', errors='ignore'))
            hasher.update(b'\x00')
            hasher.update(content.encode('utf-8', errors='ignore'))
            hasher.update(b'\x01')
        return hasher.hexdigest()
    
    def _make_vector_signature(self, articles_signature: str) -> str:
        """Combine articles signature with chunking hyperparameters for vector cache"""
        return f"{articles_signature}:{self.hyperparameters['chunk_size']}:{self.hyperparameters['chunk_overlap']}"
    
    def _make_cache_key(self, company_name: str, sme_objective: str, articles_signature: str) -> tuple:
        """Create cache key including key hyperparameters and model choice"""
        return (
            company_name.strip().lower(),
            (sme_objective or '').strip().lower(),
            articles_signature,
            self.llm_model,
            self.hyperparameters['chunk_size'],
            self.hyperparameters['chunk_overlap'],
            self.hyperparameters['top_k'],
            self.hyperparameters['temperature'],
            self.hyperparameters['max_tokens'],
        )
    
    def _get_cached_analysis(self, cache_key: tuple) -> Optional[Dict[str, Any]]:
        """Return cached analysis result if available"""
        entry = self.analysis_cache.get(cache_key)
        if not entry:
            return None
        
        # Move to end for LRU behavior
        self.analysis_cache.move_to_end(cache_key)
        
        cached_result = copy.deepcopy(entry['result'])
        cached_result['metadata']['timestamp'] = datetime.now().isoformat()
        cached_result['metadata']['cache_hit'] = True
        cached_result['metadata']['cached_at'] = entry['cached_at']
        cached_result['metadata']['vector_store_reused'] = entry['result']['metadata'].get('vector_store_reused', False)
        logger.info("🔁 Returning cached RAG analysis result")
        return cached_result
    
    def _update_analysis_cache(self, cache_key: tuple, result: Dict[str, Any], articles_signature: str) -> None:
        """Store analysis result in cache with LRU eviction"""
        cached_at = datetime.now().isoformat()
        result['metadata']['cached_at'] = cached_at
        result['metadata']['cache_hit'] = False
        cache_entry = {
            'result': copy.deepcopy(result),
            'cached_at': cached_at,
            'articles_signature': articles_signature,
        }
        cache_entry['result']['metadata']['cached_at'] = cached_at
        cache_entry['result']['metadata']['cache_hit'] = False
        
        self.analysis_cache[cache_key] = cache_entry
        self.analysis_cache.move_to_end(cache_key)
        
        while len(self.analysis_cache) > self.cache_max_entries:
            self.analysis_cache.popitem(last=False)
    
    def _get_vector_cache_entry(self, signature: str) -> Optional[Dict[str, Any]]:
        """Retrieve vector store cache entry, keeping LRU order"""
        entry = self.vector_cache.get(signature)
        if entry:
            self.vector_cache.move_to_end(signature)
        return entry
    
    def _update_vector_cache(self, signature: str, entry: Dict[str, Any]) -> None:
        """Store vector cache entry and evict old ones as needed"""
        self.vector_cache[signature] = entry
        self.vector_cache.move_to_end(signature)
        
        while len(self.vector_cache) > self.vector_cache_max_entries:
            old_signature, old_entry = self.vector_cache.popitem(last=False)
            if self.milvus_available and old_entry.get('vector_storage') == 'milvus':
                collection_name = old_entry.get('collection_name')
                if collection_name:
                    try:
                        # Check if collection exists with proper error handling
                        collection_exists = False
                        try:
                            collection_exists = utility.has_collection(collection_name)
                        except Exception as check_exc:
                            logger.warning(f"⚠️ Error checking Milvus collection existence during cleanup: {check_exc}")
                            collection_exists = False
                        
                        if collection_exists:
                            Collection(name=collection_name).drop()
                            logger.info(f"🧹 Dropped unused Milvus collection: {collection_name}")
                    except Exception as exc:
                        logger.warning(f"⚠️ Failed to drop Milvus collection {collection_name}: {exc}")
    
    def _get_collection_name(self, company_name: str, articles_signature: str) -> str:
        """Generate deterministic Milvus collection name"""
        sanitized = re.sub(r'[^a-z0-9]+', '_', company_name.lower()).strip('_')
        if not sanitized:
            sanitized = "company"
        return f"company_rag_{sanitized[:24]}_{articles_signature[:8]}"
    
    def _chunk_text(self, text: str) -> List[str]:
        """Split text into overlapping chunks (max 1800 chars for Milvus)"""
        chunk_size = self.hyperparameters['chunk_size']
        overlap = self.hyperparameters['chunk_overlap']
        max_chunk_chars = 1800  # Leave buffer for Milvus 2000 char limit
        
        words = text.split()
        chunks = []
        
        for i in range(0, len(words), chunk_size - overlap):
            chunk = ' '.join(words[i:i + chunk_size])
            
            # Ensure chunk doesn't exceed max length
            if len(chunk) > max_chunk_chars:
                # Truncate to max length at word boundary
                chunk = chunk[:max_chunk_chars].rsplit(' ', 1)[0]
            
            if len(chunk) >= 50:  # Minimum chunk size
                chunks.append(chunk)
        
        return chunks if chunks else [text[:max_chunk_chars]]
    
    def _generate_embeddings(self, texts: List[str]) -> np.ndarray:
        """Generate embeddings for texts"""
        return self.embedding_model.encode(
            texts,
            batch_size=32,
            show_progress_bar=False,
            convert_to_numpy=True
        )
    
    def _store_vectors_milvus(self, chunks: List[Dict[str, Any]], collection_name: str):
        """Store chunks and embeddings in Milvus"""
        # Check if collection exists with proper error handling
        collection_exists = False
        try:
            collection_exists = utility.has_collection(collection_name)
        except Exception as check_exc:
            logger.warning(f"⚠️ Error checking if Milvus collection exists: {check_exc}")
            collection_exists = False
        
        if collection_exists:
            try:
                existing_collection = Collection(name=collection_name)
                existing_collection.release()
                existing_collection.drop()
                logger.info(f"♻️  Replacing existing Milvus collection: {collection_name}")
            except Exception as exc:
                logger.warning(f"⚠️ Failed to drop existing Milvus collection {collection_name}: {exc}")
        
        # Define schema
        fields = [
            FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),
            FieldSchema(name="chunk_text", dtype=DataType.VARCHAR, max_length=2000),
            FieldSchema(name="article_title", dtype=DataType.VARCHAR, max_length=500),
            FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=self.embedding_dim)
        ]
        schema = CollectionSchema(fields=fields, description="RAG company analysis")
        
        # Create collection
        collection = Collection(name=collection_name, schema=schema)
        
        # Prepare data (ensure lengths don't exceed Milvus limits)
        chunk_texts = [c['text'][:1800] for c in chunks]  # Max 2000, leave buffer
        titles = [c['title'][:400] for c in chunks]  # Max 500, leave buffer
        embeddings = [c['embedding'].tolist() for c in chunks]
        
        # Insert data
        collection.insert([chunk_texts, titles, embeddings])
        
        # Create index
        index_params = {
            "metric_type": "COSINE",
            "index_type": "IVF_FLAT",
            "params": {"nlist": 128}
        }
        collection.create_index(field_name="embedding", index_params=index_params)
        collection.load()
        
        self.collection = collection
        logger.info(f"✅ Stored {len(chunks)} chunks in Milvus collection: {collection_name}")
    
    def _store_vectors_memory(self, chunks: List[Dict[str, Any]]):
        """Store chunks and embeddings in memory"""
        self.in_memory_chunks = chunks
        self.in_memory_embeddings = np.vstack([c['embedding'] for c in chunks])
        logger.info(f"✅ Stored {len(chunks)} chunks in memory")
    
    def _retrieve_milvus(self, query: str, top_k: int) -> List[Dict[str, Any]]:
        """Retrieve relevant chunks from Milvus"""
        query_embedding = self._generate_embeddings([query])[0].tolist()
        
        search_params = {"metric_type": "COSINE", "params": {"nprobe": 10}}
        results = self.collection.search(
            data=[query_embedding],
            anns_field="embedding",
            param=search_params,
            limit=top_k,
            output_fields=["chunk_text", "article_title"]
        )
        
        chunks = []
        threshold = self.hyperparameters['similarity_threshold']
        min_threshold = 0.05  # Absolute minimum to avoid completely irrelevant chunks
        
        for hit in results[0]:
            similarity = float(hit.distance)
            # Use threshold, but be more lenient if we have few chunks
            if similarity >= threshold or (len(chunks) == 0 and similarity >= min_threshold):
                chunks.append({
                    'text': hit.entity.get('chunk_text'),
                    'title': hit.entity.get('article_title'),
                    'similarity': similarity
                })
        
        # If we still have no chunks, include at least the top result if above minimum
        if not chunks and len(results[0]) > 0:
            top_hit = results[0][0]
            top_similarity = float(top_hit.distance)
            if top_similarity >= min_threshold:
                chunks.append({
                    'text': top_hit.entity.get('chunk_text'),
                    'title': top_hit.entity.get('article_title'),
                    'similarity': top_similarity
                })
        
        return chunks
    
    def _retrieve_memory(self, query: str, top_k: int) -> List[Dict[str, Any]]:
        """Retrieve relevant chunks from memory"""
        query_embedding = self._generate_embeddings([query])[0].reshape(1, -1)
        
        similarities = cosine_similarity(query_embedding, self.in_memory_embeddings)[0]
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        chunks = []
        threshold = self.hyperparameters['similarity_threshold']
        min_threshold = 0.05  # Absolute minimum to avoid completely irrelevant chunks
        
        for idx in top_indices:
            similarity = float(similarities[idx])
            # Use threshold, but if we have very few chunks, be more lenient
            # Always include top result if it's above minimum threshold
            if similarity >= threshold or (len(chunks) == 0 and similarity >= min_threshold):
                chunk = self.in_memory_chunks[idx]
                chunks.append({
                    'text': chunk['text'],
                    'title': chunk['title'],
                    'similarity': similarity
                })
        
        # If we still have no chunks but have some with reasonable similarity, include at least the top one
        if not chunks and len(top_indices) > 0:
            top_similarity = float(similarities[top_indices[0]])
            if top_similarity >= min_threshold:
                chunk = self.in_memory_chunks[top_indices[0]]
                chunks.append({
                    'text': chunk['text'],
                    'title': chunk['title'],
                    'similarity': top_similarity
                })
        
        return chunks
    
    def _call_llm(self, prompt: str, temperature: Optional[float] = None, max_tokens: Optional[int] = None) -> Optional[str]:
        """Call Llama-3 via Ollama API with fallback for localhost/ollama hostname"""
        temp = temperature if temperature is not None else self.hyperparameters['temperature']
        max_tok = max_tokens if max_tokens is not None else self.hyperparameters['max_tokens']
        
        payload = {
            "model": self.llm_model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": temp,
                "num_predict": max_tok
            }
        }
        
        # Try multiple URLs in case of DNS/hostname issues
        # First try the configured URL, then fallback to localhost or ollama
        urls_to_try = [self.ollama_host]
        
        # Extract hostname and port to build fallback URLs
        url_match = re.match(r'(https?://)([^:/]+)(:\d+)?(/.*)?$', self.ollama_host)
        if url_match:
            protocol, hostname, port, path = url_match.groups()
            port = port or ':11434'  # Default Ollama port
            path = path or ''
            
            # If configured URL uses 'ollama' hostname (Docker), also try 'localhost'
            if 'ollama' in hostname and 'localhost' not in hostname:
                localhost_url = f"{protocol}localhost{port}{path}"
                urls_to_try.append(localhost_url)
            # If configured URL uses 'localhost', also try 'ollama' (for Docker)
            elif 'localhost' in hostname and 'ollama' not in hostname:
                ollama_url = f"{protocol}ollama{port}{path}"
                urls_to_try.append(ollama_url)
        
        # Try each URL until one works
        last_error = None
        for url in urls_to_try:
            try:
                # Use a session for connection pooling and proper cleanup
                with requests.Session() as session:
                    api_url = f"{url}/api/generate"
                    logger.debug(f"Trying Ollama at: {api_url}")
                    response = session.post(
                        api_url,
                        json=payload,
                        timeout=120
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        generated_text = result.get('response', '')
                        logger.debug(f"✅ Successfully connected to Ollama at: {url}")
                        return generated_text
                    else:
                        logger.warning(f"LLM API error at {url}: {response.status_code}")
                        last_error = Exception(f"HTTP {response.status_code}")
            
            except Exception as e:
                logger.debug(f"Failed to connect to Ollama at {url}: {e}")
                last_error = e
                continue
        
        # All URLs failed
        logger.error(f"LLM call failed for all URLs: {last_error}")
        return None
    
    def _parse_json_response(self, response: str) -> Optional[Dict[str, Any]]:
        """Robustly parse JSON from LLM response"""
        if not response or len(response.strip()) == 0:
            logger.warning("Empty response from LLM")
            return None
        
        def strip_json_comments(json_str: str) -> str:
            """Remove single-line and multi-line comments from JSON string"""
            # Remove single-line comments (// ...) - but preserve // inside strings
            lines = json_str.split('\n')
            cleaned_lines = []
            for line in lines:
                # Find // that's not inside a string
                in_string = False
                escape_next = False
                comment_pos = -1
                for i, char in enumerate(line):
                    if escape_next:
                        escape_next = False
                        continue
                    if char == '\\':
                        escape_next = True
                        continue
                    if char == '"' and not escape_next:
                        in_string = not in_string
                    if not in_string and char == '/' and i + 1 < len(line) and line[i + 1] == '/':
                        comment_pos = i
                        break
                if comment_pos >= 0:
                    line = line[:comment_pos].rstrip()
                cleaned_lines.append(line)
            json_str = '\n'.join(cleaned_lines)
            
            # Remove multi-line comments (/* ... */)
            while '/*' in json_str:
                start = json_str.find('/*')
                end = json_str.find('*/', start)
                if end == -1:
                    break
                json_str = json_str[:start] + json_str[end + 2:]
            
            return json_str
        
        # Try direct JSON parsing
        try:
            cleaned = strip_json_comments(response.strip())
            return json.loads(cleaned)
        except json.JSONDecodeError:
            pass
        
        # Try extracting JSON from markdown code blocks with capturing groups
        capturing_patterns = [
            r'```json\s*(\{.*?\})\s*```',
            r'```\s*(\{.*?\})\s*```',
        ]
        
        for pattern in capturing_patterns:
            try:
                match = re.search(pattern, response, re.DOTALL)
                if match:
                    json_str = match.group(1)
                    json_str = strip_json_comments(json_str)
                    return json.loads(json_str)
            except (json.JSONDecodeError, AttributeError, IndexError):
                continue
        
        # Try extracting JSON without capturing groups
        non_capturing_patterns = [
            r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}',
        ]
        
        for pattern in non_capturing_patterns:
            try:
                match = re.search(pattern, response, re.DOTALL)
                if match:
                    json_str = match.group(0)
                    json_str = strip_json_comments(json_str)
                    return json.loads(json_str)
            except (json.JSONDecodeError, AttributeError, IndexError):
                continue
        
        # Try finding JSON after common markers
        markers = ['JSON:', 'json:', 'Output:', 'Result:']
        for marker in markers:
            if marker in response:
                json_part = response.split(marker, 1)[1].strip()
                try:
                    match = re.search(r'\{.*\}', json_part, re.DOTALL)
                    if match:
                        json_str = match.group(0)
                        json_str = strip_json_comments(json_str)
                        return json.loads(json_str)
                except json.JSONDecodeError:
                    continue
        
        logger.error(f"Failed to parse JSON from response: {response[:200]}...")
        return None
    
    def extract_category(
        self,
        category_name: str,
        query: str,
        prompt_template: str,
        company_name: str,
        sme_objective: str = ""
    ) -> Dict[str, Any]:
        """Extract a specific category using RAG"""
        logger.info(f"📊 Extracting: {category_name}")
        
        # Retrieve relevant chunks
        top_k = self.hyperparameters['top_k']
        
        if self.milvus_available and self.collection:
            chunks = self._retrieve_milvus(query, top_k)
        else:
            chunks = self._retrieve_memory(query, top_k)
        
        if not chunks:
            logger.warning(f"No relevant chunks found for {category_name}")
            return {
                'category': category_name,
                'data': [],
                'confidence': 0.0,
                'chunks_retrieved': 0
            }
        
        # Build context from chunks
        context = "\n\n".join([
            f"[Article: {chunk['title']}]\n{chunk['text']}"
            for chunk in chunks[:5]
        ])
        
        # Build prompt
        prompt = prompt_template.format(
            company_name=company_name,
            sme_objective=sme_objective,
            context=context
        )
        
        # Call LLM
        response = self._call_llm(prompt)
        
        if not response:
            logger.error(f"LLM returned empty response for {category_name}")
            return {
                'category': category_name,
                'data': [],
                'confidence': 0.0,
                'chunks_retrieved': len(chunks),
                'error': 'LLM returned empty response'
            }
        
        # Parse JSON
        parsed = self._parse_json_response(response)
        
        if not parsed:
            logger.error(f"Failed to parse LLM response for {category_name}")
            return {
                'category': category_name,
                'data': {},
                'confidence': 0.0,
                'chunks_retrieved': len(chunks),
                'error': 'Failed to parse LLM response'
            }
        
        # Fix malformed Company Info structure if needed
        if category_name == 'Company Info' and isinstance(parsed, dict):
            if 'description' in parsed:
                description = parsed['description']
                # If description is a list, join into sentences
                if isinstance(description, list):
                    # Join list items into a single description string
                    parsed['description'] = ' '.join(str(s) for s in description if s)
                elif isinstance(description, dict):
                    # If description is a dict with string values (malformed JSON from LLM)
                    # Extract all string values and create proper sentence structure
                    sentences = []
                    for key, value in description.items():
                        if isinstance(value, str) and value.strip():
                            sentences.append(value.strip())
                    
                    if sentences:
                        # If we got sentences, create proper structure with sentence1-sentence5
                        if len(sentences) >= 5:
                            parsed['description'] = {
                                'sentence1': sentences[0],
                                'sentence2': sentences[1],
                                'sentence3': sentences[2],
                                'sentence4': sentences[3],
                                'sentence5': sentences[4]
                            }
                        else:
                            # If less than 5 sentences, join them into a single description
                            parsed['description'] = ' '.join(sentences)
                    else:
                        # Fallback: try to use dict values as-is
                        parsed['description'] = str(description)
        
        # Calculate confidence based on retrieval quality
        avg_similarity = np.mean([c['similarity'] for c in chunks])
        
        return {
            'category': category_name,
            'data': parsed if isinstance(parsed, dict) else {'content': parsed},
            'confidence': float(avg_similarity),
            'chunks_retrieved': len(chunks)
        }
    
    def analyze_comprehensive(
        self,
        articles: List[Dict[str, str]],
        company_name: str,
        sme_objective: str = "",
        progress_callback: Optional[Callable[[str, int, int], None]] = None
    ) -> Dict[str, Any]:
        """
        Perform comprehensive RAG analysis on company articles
        
        Extracts 10 categories:
        1. Latest Updates
        2. Challenges
        3. Decision Makers
        4. Market Position
        5. Future Plans
        6. Action Plan
        7. Solution
        8. Company Info
        9. Strengths
        10. Opportunities
        
        Args:
            articles: List of article dictionaries with 'title' and 'content'
            company_name: Name of the company being analyzed
            sme_objective: SME's objectives and capabilities
            progress_callback: Optional callback function(category_name, category_num, total_categories) for progress updates
        """
        start_time = datetime.now()
        logger.info(f"🎯 Starting comprehensive RAG analysis for: {company_name}")
        logger.info(f"📚 Processing {len(articles)} articles")
        
        articles_signature = self._generate_articles_signature(articles)
        cache_key = self._make_cache_key(company_name, sme_objective, articles_signature)
        cached_result = self._get_cached_analysis(cache_key)
        if cached_result:
            return cached_result
        
        vector_signature = self._make_vector_signature(articles_signature)
        vector_cache_entry = self._get_vector_cache_entry(vector_signature)
        vector_store_reused = False
        vector_storage_used = 'milvus' if self.milvus_available else 'in-memory'
        chunk_count = 0
        collection_name = None
        
        if vector_cache_entry:
            if self.milvus_available and vector_cache_entry.get('vector_storage') == 'milvus':
                try:
                    collection_name = vector_cache_entry.get('collection_name')
                    if collection_name:
                        # Check if collection exists with proper error handling
                        try:
                            collection_exists = utility.has_collection(collection_name)
                        except Exception as check_exc:
                            logger.warning(f"⚠️ Error checking Milvus collection existence: {check_exc}")
                            collection_exists = False
                        
                        if collection_exists:
                            self.collection = Collection(name=collection_name)
                            self.collection.load()
                            chunk_count = vector_cache_entry.get('chunk_count', 0)
                            vector_storage_used = 'milvus'
                            vector_store_reused = True
                            logger.info(f"♻️ Reusing Milvus collection '{collection_name}' ({chunk_count} chunks)")
                        else:
                            vector_cache_entry = None
                            logger.info(f"ℹ️ Milvus collection '{collection_name}' not found; regenerating vectors.")
                    else:
                        vector_cache_entry = None
                        logger.info("ℹ️ No collection name in cache; regenerating vectors.")
                except Exception as exc:
                    vector_cache_entry = None
                    self.collection = None
                    logger.warning(f"⚠️ Failed to reuse Milvus collection: {exc}. Regenerating vectors.")
            elif not self.milvus_available and vector_cache_entry.get('vector_storage') == 'memory':
                try:
                    self.in_memory_chunks = copy.deepcopy(vector_cache_entry['chunks'])
                    self.in_memory_embeddings = vector_cache_entry['embeddings'].copy()
                    chunk_count = vector_cache_entry.get('chunk_count', 0)
                    vector_storage_used = 'in-memory'
                    vector_store_reused = True
                    logger.info(f"♻️ Reusing in-memory vector store ({chunk_count} chunks)")
                except Exception as exc:
                    vector_cache_entry = None
                    self.in_memory_chunks = []
                    self.in_memory_embeddings = None
                    logger.warning(f"⚠️ Failed to reuse in-memory vectors: {exc}. Regenerating vectors.")
        
        all_chunks: List[Dict[str, Any]] = []
        if not vector_store_reused:
            # Step 1: Chunk all articles
            for article in articles:
                title = article.get('title', '')[:400]  # Truncate title to 400 chars
                content = article.get('content', '')
                text = f"{title} {content}"
                
                chunks = self._chunk_text(text)
                for chunk in chunks:
                    all_chunks.append({
                        'text': chunk[:1800],  # Ensure max 1800 chars
                        'title': title
                    })
            
            chunk_count = len(all_chunks)
            logger.info(f"✂️ Created {chunk_count} chunks")
            
            # Step 2: Generate embeddings
            logger.info("🔢 Generating embeddings...")
            chunk_texts = [c['text'] for c in all_chunks]
            embeddings = self._generate_embeddings(chunk_texts)
            
            for i, chunk in enumerate(all_chunks):
                chunk['embedding'] = embeddings[i]
            
            logger.info(f"✅ Generated {len(embeddings)} embeddings")
            
            # Step 3: Store vectors
            if self.milvus_available:
                collection_name = self._get_collection_name(company_name, articles_signature)
                try:
                    self._store_vectors_milvus(all_chunks, collection_name)
                    vector_storage_used = 'milvus'
                    self._update_vector_cache(vector_signature, {
                        'vector_storage': 'milvus',
                        'collection_name': collection_name,
                        'chunk_count': chunk_count,
                        'stored_at': datetime.now().isoformat(),
                    })
                except Exception as exc:
                    logger.warning(f"⚠️ Failed to store vectors in Milvus: {exc}. Falling back to in-memory storage.")
                    # Clear any partial Milvus state
                    self.collection = None
                    # Fall back to in-memory storage
                    self._store_vectors_memory(all_chunks)
                    vector_storage_used = 'in-memory'
                    self._update_vector_cache(vector_signature, {
                        'vector_storage': 'memory',
                        'chunks': copy.deepcopy(self.in_memory_chunks),
                        'embeddings': self.in_memory_embeddings.copy(),
                        'chunk_count': chunk_count,
                        'stored_at': datetime.now().isoformat(),
                    })
            else:
                self._store_vectors_memory(all_chunks)
                vector_storage_used = 'in-memory'
                if self.in_memory_embeddings is not None:
                    self._update_vector_cache(vector_signature, {
                        'vector_storage': 'memory',
                        'chunks': copy.deepcopy(self.in_memory_chunks),
                        'embeddings': self.in_memory_embeddings.copy(),
                        'chunk_count': chunk_count,
                        'stored_at': datetime.now().isoformat(),
                    })
        else:
            logger.info("✅ Vector store reused successfully; skipping chunking and embedding regeneration.")
        
        # Step 4: Extract all 10 categories
        categories = self._get_category_configs(company_name, sme_objective)
        
        results = {}
        total_categories = len(categories)
        category_num = 0
        
        for cat_key, cat_config in categories.items():
            category_num += 1
            category_name = cat_config['name']
            
            # Call progress callback if provided
            if progress_callback:
                try:
                    progress_callback(category_name, category_num, total_categories)
                except Exception as e:
                    logger.warning(f"Progress callback failed: {e}")
            
            result = self.extract_category(
                category_name=category_name,
                query=cat_config['query'],
                prompt_template=cat_config['prompt'],
                company_name=company_name,
                sme_objective=sme_objective
            )
            results[cat_key] = result
        
        # Calculate overall metrics
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        total_items = sum(
            len(results[key]['data']) if isinstance(results[key]['data'], list) else 1
            for key in results
            if results[key]['data']
        )
        
        avg_confidence = np.mean([
            results[key]['confidence']
            for key in results
            if results[key]['confidence'] > 0
        ]) if any(results[key]['confidence'] > 0 for key in results) else 0.0
        
        logger.info(f"✅ Analysis complete in {duration:.1f}s")
        logger.info(f"📊 Extracted {total_items} total items across 10 categories")
        
        metadata = {
                'company_name': company_name,
                'sme_objective': sme_objective,
                'articles_processed': len(articles),
            'chunks_created': chunk_count,
                'total_items_extracted': total_items,
                'average_confidence': float(avg_confidence),
                'duration_seconds': duration,
                'timestamp': datetime.now().isoformat(),
            'hyperparameters': dict(self.hyperparameters),
            'vector_storage': vector_storage_used,
            'vector_store_reused': vector_store_reused,
            'cache_hit': False,
            'articles_signature': articles_signature,
        }
        
        result_payload = {
            'analysis': results,
            'metadata': metadata
        }
        
        self._update_analysis_cache(cache_key, result_payload, articles_signature)
        return result_payload
    
    def _get_category_configs(self, company_name: str, sme_objective: str) -> Dict[str, Dict[str, str]]:
        """Get configuration for all 10 categories"""
        return {
            'latest_updates': {
                'name': 'Latest Updates',
                'query': f'latest news updates announcements {company_name}',
                'prompt': '''Analyze these articles about {company_name} and extract the latest updates.

CONTEXT:
{context}

Extract recent updates (product launches, financial results, partnerships, announcements) and return ONLY valid JSON:

{{
  "updates": [
    {{
      "update": "Brief description of the update",
      "confidence": "high/medium/low"
    }}
  ]
}}

Rules:
- Only extract factual information from the context
- Focus on recent developments (last 6-12 months)
- Be concise (1-2 sentences per update)
- Return empty array if no updates found
- Return ONLY JSON, no explanations

JSON:'''
            },
            
            'challenges': {
                'name': 'Challenges',
                'query': f'challenges problems difficulties issues {company_name}',
                'prompt': '''Analyze these articles about {company_name} and extract their challenges.

CONTEXT:
{context}

Extract challenges (competitive pressures, operational difficulties, regulatory issues, market challenges) and return ONLY valid JSON:

{{
  "challenges": [
    {{
      "challenge": "Brief description of the challenge",
      "impact": "high/medium/low"
    }}
  ]
}}

Rules:
- Only extract factual challenges mentioned in the context
- Focus on current and near-term challenges
- Be specific and concise
- Return empty array if no challenges found
- Return ONLY JSON, no explanations

JSON:'''
            },
            
            'decision_makers': {
                'name': 'Decision Makers',
                'query': f'CEO executives leadership management {company_name}',
                'prompt': '''Analyze these articles about {company_name} and extract decision makers.

CONTEXT:
{context}

Extract key decision makers (executives, leaders, board members) and return ONLY valid JSON:

{{
  "decision_makers": [
    {{
      "name": "Full name",
      "role": "Job title/position"
    }}
  ]
}}

Rules:
- Only extract names and roles explicitly mentioned in the context
- Include C-level executives, VPs, directors, board members
- Use exact names and titles from the articles
- Return empty array if no decision makers found
- Return ONLY JSON, no explanations

JSON:'''
            },
            
            'market_position': {
                'name': 'Market Position',
                'query': f'market position competitors competitive advantage {company_name}',
                'prompt': '''Analyze these articles about {company_name} and extract their market position.

CONTEXT:
{context}

Extract market position information and return ONLY valid JSON:

{{
  "description": "Brief description of market position (2-3 sentences)",
  "competitors": ["Competitor 1", "Competitor 2"],
  "market_share": "Market share percentage if mentioned, otherwise null"
}}

Rules:
- Only extract factual information from the context
- Focus on competitive positioning and market standing
- List specific competitors mentioned
- Return null for market_share if not mentioned
- Return ONLY JSON, no explanations

JSON:'''
            },
            
            'future_plans': {
                'name': 'Future Plans',
                'query': f'future plans strategy expansion investments {company_name}',
                'prompt': '''Analyze these articles about {company_name} and extract their future plans.

CONTEXT:
{context}

Extract future plans (expansion, investments, strategic initiatives, product roadmap) and return ONLY valid JSON:

{{
  "plans": [
    {{
      "plan": "Brief description of the plan",
      "timeline": "When it's expected to happen (e.g., 'Q2 2024', '2025', 'Next year')"
    }}
  ]
}}

Rules:
- Only extract factual plans mentioned in the context
- Focus on forward-looking statements and announced initiatives
- Include timeline if mentioned
- Be specific and concise
- Return empty array if no future plans found
- Return ONLY JSON, no explanations

JSON:'''
            },
            
            'action_plan': {
                'name': 'Action Plan',
                'query': f'engagement opportunities partnership {company_name} {sme_objective}',
                'prompt': '''Analyze these articles about {company_name} and recommend an action plan for an SME to engage with them.

SME OBJECTIVE: {sme_objective}

CONTEXT:
{context}

Based on the company's recent updates and the SME's capabilities, recommend the next best steps for engagement and return ONLY valid JSON:

{{
  "action_steps": [
    {{
      "step": "Specific action to take",
      "rationale": "Why this step makes sense based on the context",
      "priority": "high/medium/low"
    }}
  ]
}}

Rules:
- Provide 3 actionable steps
- Each step should be specific and practical
- Rationale should reference information from the context
- Consider the SME's objectives: {sme_objective}
- Prioritize steps based on potential impact
- Return ONLY JSON, no explanations

JSON:'''
            },
            
            'solution': {
                'name': 'Solution',
                'query': f'needs requirements solutions {company_name} {sme_objective}',
                'prompt': '''Analyze these articles about {company_name} and identify relevant SME solutions.

SME OBJECTIVE: {sme_objective}

CONTEXT:
{context}

Based on the company's recent updates and challenges, identify the most relevant SME solutions and return ONLY valid JSON:

{{
  "solutions": [
    {{
      "solution": "Specific SME solution or offering",
      "value_proposition": "How it addresses the company's needs",
      "relevance": "high/medium/low"
    }}
  ]
}}

Rules:
- Provide 3 relevant solutions
- Each solution should address a specific need or opportunity mentioned in the context
- Value proposition should be concrete and specific
- Consider the SME's capabilities: {sme_objective}
- Rank by relevance to the company's current situation
- Return ONLY JSON, no explanations

JSON:'''
            },
            
            'company_info': {
                'name': 'Company Info',
                'query': f'about {company_name} business operations products services',
                'prompt': '''Analyze these articles about {company_name} and create a concise company description.

CONTEXT:
{context}

Create a 5-sentence company description covering what they do, their main products/services, and their market. Return ONLY valid JSON with this exact structure:

{{
  "description": {{
    "sentence1": "First sentence about what the company does",
    "sentence2": "Second sentence about their main products/services",
    "sentence3": "Third sentence about their market position",
    "sentence4": "Fourth sentence about their scale/reach",
    "sentence5": "Fifth sentence about their recent focus or direction"
  }},
  "industry": "Primary industry",
  "headquarters": "Location if mentioned, otherwise null"
}}

Rules:
- The description field MUST be an object with sentence1, sentence2, sentence3, sentence4, sentence5
- Each sentence should be a string, not an array or other structure
- Cover: what they do, main offerings, market position, scale/reach, recent focus
- Only use information from the context
- Be factual and concise
- Return ONLY valid JSON, no explanations or markdown

JSON:'''
            },
            
            'strengths': {
                'name': 'Strengths',
                'query': f'strengths advantages competitive edge success {company_name}',
                'prompt': '''Analyze these articles about {company_name} and extract their main strengths.

CONTEXT:
{context}

Extract key competitive advantages and positive aspects and return ONLY valid JSON:

{{
  "strengths": [
    {{
      "strength": "Specific strength or advantage",
      "evidence": "Supporting evidence from the articles"
    }}
  ]
}}

Rules:
- Only extract strengths mentioned or implied in the context
- Focus on competitive advantages, unique capabilities, market leadership
- Provide evidence from the articles
- Be specific and factual
- Return empty array if no clear strengths found
- Return ONLY JSON, no explanations

JSON:'''
            },
            
            'opportunities': {
                'name': 'Opportunities',
                'query': f'opportunities growth potential market expansion {company_name}',
                'prompt': '''Analyze these articles about {company_name} and identify business opportunities.

CONTEXT:
{context}

Extract potential growth areas and market opportunities and return ONLY valid JSON:

{{
  "opportunities": [
    {{
      "opportunity": "Specific opportunity or growth area",
      "potential": "high/medium/low",
      "basis": "What in the articles suggests this opportunity"
    }}
  ]
}}

Rules:
- Only extract opportunities mentioned or clearly implied in the context
- Focus on market expansion, new products, partnerships, untapped markets
- Provide basis from the articles
- Be specific and realistic
- Return empty array if no clear opportunities found
- Return ONLY JSON, no explanations

JSON:'''
            }
        }
