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
import numpy as np
import requests
from typing import List, Dict, Any, Optional
from datetime import datetime
from loguru import logger
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# Milvus (optional, with in-memory fallback)
try:
    from pymilvus import connections, Collection, FieldSchema, CollectionSchema, DataType, utility
    MILVUS_AVAILABLE = True
except ImportError:
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
        self.ollama_host = ollama_host
        self.llm_model = llm_model
        
        # Hyperparameters
        self.hyperparameters = {
            'chunk_size': 500,
            'chunk_overlap': 100,
            'top_k': 5,
            'temperature': 0.3,
            'max_tokens': 1000,
            'similarity_threshold': 0.2
        }
        
        # Initialize embedding model
        logger.info("📦 Loading SentenceTransformer model...")
        self.embedding_model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
        self.embedding_dim = self.embedding_model.get_sentence_embedding_dimension()
        logger.info(f"✅ Embedding model loaded (dim={self.embedding_dim})")
        
        # Initialize Milvus or in-memory storage
        self.milvus_available = False
        self.collection = None
        self.in_memory_chunks = []
        self.in_memory_embeddings = None
        
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
    
    def _store_vectors_milvus(self, chunks: List[Dict[str, Any]]):
        """Store chunks and embeddings in Milvus"""
        collection_name = f"company_rag_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Drop existing collection if exists
        if utility.has_collection(collection_name):
            utility.drop_collection(collection_name)
        
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
        for hit in results[0]:
            if hit.distance >= self.hyperparameters['similarity_threshold']:
                chunks.append({
                    'text': hit.entity.get('chunk_text'),
                    'title': hit.entity.get('article_title'),
                    'similarity': float(hit.distance)
                })
        
        return chunks
    
    def _retrieve_memory(self, query: str, top_k: int) -> List[Dict[str, Any]]:
        """Retrieve relevant chunks from memory"""
        query_embedding = self._generate_embeddings([query])[0].reshape(1, -1)
        
        similarities = cosine_similarity(query_embedding, self.in_memory_embeddings)[0]
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        chunks = []
        for idx in top_indices:
            if similarities[idx] >= self.hyperparameters['similarity_threshold']:
                chunk = self.in_memory_chunks[idx]
                chunks.append({
                    'text': chunk['text'],
                    'title': chunk['title'],
                    'similarity': float(similarities[idx])
                })
        
        return chunks
    
    def _call_llm(self, prompt: str, temperature: Optional[float] = None, max_tokens: Optional[int] = None) -> Optional[str]:
        """Call Llama-3 via Ollama API"""
        temp = temperature if temperature is not None else self.hyperparameters['temperature']
        max_tok = max_tokens if max_tokens is not None else self.hyperparameters['max_tokens']
        
        try:
            payload = {
                "model": self.llm_model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": temp,
                    "num_predict": max_tok
                }
            }
            
            response = requests.post(
                f"{self.ollama_host}/api/generate",
                json=payload,
                timeout=120
            )
            
            if response.status_code == 200:
                result = response.json()
                generated_text = result.get('response', '')
                return generated_text
            else:
                logger.error(f"LLM API error: {response.status_code}")
                return None
        
        except Exception as e:
            logger.error(f"LLM call failed: {e}")
            return None
    
    def _parse_json_response(self, response: str) -> Optional[Dict[str, Any]]:
        """Robustly parse JSON from LLM response"""
        if not response or len(response.strip()) == 0:
            logger.warning("Empty response from LLM")
            return None
        
        # Try direct JSON parsing
        try:
            return json.loads(response.strip())
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
                        return json.loads(match.group(0))
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
        sme_objective: str = ""
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
        """
        start_time = datetime.now()
        logger.info(f"🎯 Starting comprehensive RAG analysis for: {company_name}")
        logger.info(f"📚 Processing {len(articles)} articles")
        
        # Step 1: Chunk all articles
        all_chunks = []
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
        
        logger.info(f"✂️ Created {len(all_chunks)} chunks")
        
        # Step 2: Generate embeddings
        logger.info("🔢 Generating embeddings...")
        chunk_texts = [c['text'] for c in all_chunks]
        embeddings = self._generate_embeddings(chunk_texts)
        
        for i, chunk in enumerate(all_chunks):
            chunk['embedding'] = embeddings[i]
        
        logger.info(f"✅ Generated {len(embeddings)} embeddings")
        
        # Step 3: Store vectors
        if self.milvus_available:
            self._store_vectors_milvus(all_chunks)
        else:
            self._store_vectors_memory(all_chunks)
        
        # Step 4: Extract all 10 categories
        categories = self._get_category_configs(company_name, sme_objective)
        
        results = {}
        for cat_key, cat_config in categories.items():
            result = self.extract_category(
                category_name=cat_config['name'],
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
        
        return {
            'analysis': results,
            'metadata': {
                'company_name': company_name,
                'sme_objective': sme_objective,
                'articles_processed': len(articles),
                'chunks_created': len(all_chunks),
                'total_items_extracted': total_items,
                'average_confidence': float(avg_confidence),
                'duration_seconds': duration,
                'timestamp': datetime.now().isoformat(),
                'hyperparameters': self.hyperparameters,
                'vector_storage': 'milvus' if self.milvus_available else 'in-memory'
            }
        }
    
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
