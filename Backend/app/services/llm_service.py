"""
Shared LLM Service using llama.cpp with Phi-3.5 Mini
Provides direct inference without HTTP overhead for optimal speed
"""

import os
import logging
import threading
from typing import Optional, Dict, Any
from pathlib import Path
from loguru import logger

# Try to import llama-cpp-python
try:
    from llama_cpp import Llama
    LLAMA_CPP_AVAILABLE = True
except ImportError:
    LLAMA_CPP_AVAILABLE = False
    Llama = None
    logger.warning("llama-cpp-python not available. Install with: pip install llama-cpp-python")

logger = logging.getLogger(__name__)


class LLMService:
    """
    Shared LLM service using llama.cpp for direct inference.
    Uses Phi-3.5 Mini 3.8B Q8_0 for optimal speed/quality balance.
    
    Note: In Celery workers, each process gets its own instance due to fork().
    The singleton pattern works within a process but not across forks.
    
    Thread-safe: Uses a lock to ensure model is only loaded once, even with concurrent access.
    llama.cpp is thread-safe for concurrent inference calls once the model is loaded.
    """
    
    _instance = None
    _llm = None
    _load_lock = threading.Lock()  # Lock for thread-safe model loading
    
    def __new__(cls):
        """Singleton pattern to ensure model is loaded only once per process"""
        if cls._instance is None:
            cls._instance = super(LLMService, cls).__new__(cls)
            # Reset _llm for new process (important for Celery fork pool)
            cls._instance._llm = None
        return cls._instance
    
    def __init__(self):
        """Initialize LLM service - model is loaded lazily on first use"""
        # Don't load model in __init__ - load it lazily on first generate() call
        # This avoids issues with Celery fork pool and asyncio
        self._initialized = False
        if not hasattr(self, '_llm'):
            self._llm = None
        if not hasattr(self, '_load_lock'):
            self._load_lock = threading.Lock()  # Thread-safe lock for model loading
    
    def _load_model(self):
        """Load Phi-3.5 Mini model using llama.cpp"""
        if not LLAMA_CPP_AVAILABLE:
            logger.error("llama-cpp-python not available. Cannot load model.")
            return
        
        from app.config import settings
        
        # Get model path from settings
        model_path = settings.llm_model_path
        
        # Check if model file exists
        if not os.path.exists(model_path):
            logger.error(f"Model file not found: {model_path}")
            logger.error(f"Please download Phi-3.5 Mini Q8_0 model to: {model_path}")
            logger.error("Download from: https://huggingface.co/bartowski/Phi-3.5-mini-instruct-GGUF")
            return
        
        try:
            logger.info(f"🚀 Loading Phi-3.5 Mini model from: {model_path}")
            
            # Suppress Metal/GPU warnings on CPU-only systems (redirect stderr temporarily)
            import sys
            from io import StringIO
            
            # Save original stderr
            original_stderr = sys.stderr
            
            # Redirect stderr to suppress Metal initialization warnings
            # (These are harmless - just indicate GPU isn't available)
            sys.stderr = StringIO()
            
            try:
                # Load model with optimal settings for 32GB RAM server
                self._llm = Llama(
                    model_path=model_path,
                    n_ctx=settings.llm_n_ctx,  # Context window (4096 or larger)
                    n_threads=settings.llm_n_threads,  # CPU threads for inference
                    n_batch=512,  # Batch size for prompt processing (larger = faster, more memory)
                    n_gpu_layers=0,  # CPU only (set to >0 if GPU available)
                    verbose=False,
                    use_mlock=True,  # Lock memory to prevent swapping
                    use_mmap=True,  # Memory map for faster loading
                    repeat_penalty=1.1,  # Penalize repetition for better quality
                    top_p=0.95,  # Nucleus sampling for better quality
                )
            finally:
                # Restore stderr
                sys.stderr = original_stderr
            
            logger.info(f"✅ Phi-3.5 Mini model loaded successfully")
            logger.info(f"   Context window: {settings.llm_n_ctx}")
            logger.info(f"   CPU threads: {settings.llm_n_threads}")
            
        except Exception as e:
            logger.error(f"❌ Failed to load LLM model: {e}")
            self._llm = None
            raise
    
    def _format_phi3_prompt(self, user_message: str, system_message: str = "") -> str:
        """
        Format prompt for Phi-3.5 Mini (ChatML format)
        
        Phi-3.5 uses ChatML format:
        <|system|>
        {system_message}
        <|end|>
        <|user|>
        {user_message}
        <|end|>
        <|assistant|>
        """
        if system_message:
            return f"<|system|>\n{system_message}<|end|>\n<|user|>\n{user_message}<|end|>\n<|assistant|>\n"
        return f"<|user|>\n{user_message}<|end|>\n<|assistant|>\n"
    
    def generate(
        self,
        prompt: str,
        system_message: str = "",
        temperature: float = 0.3,
        max_tokens: int = 1000,
        stop: Optional[list] = None
    ) -> Optional[str]:
        """
        Generate text using Phi-3.5 Mini via llama.cpp
        
        Args:
            prompt: User prompt/message
            system_message: Optional system message for context
            temperature: Sampling temperature (0.0-1.0)
            max_tokens: Maximum tokens to generate
            stop: List of stop sequences
            
        Returns:
            Generated text or None if error
        """
        if not LLAMA_CPP_AVAILABLE:
            logger.error("llama-cpp-python not available")
            return None
        
        # Lazy loading - only load model when first needed (fork-safe and thread-safe)
        # Use a lock to ensure only one thread loads the model, others wait
        if self._llm is None and not self._initialized:
            with self._load_lock:
                # Double-check pattern: another thread might have loaded it while we waited
                if self._llm is None and not self._initialized:
                    try:
                        logger.info("Loading LLM model (lazy initialization)...")
                        self._load_model()
                        self._initialized = True
                    except Exception as e:
                        logger.error(f"Failed to load LLM model: {e}")
                        self._initialized = True  # Mark as initialized to avoid retry loops
                        return None
                # If we get here, another thread loaded it, so we can continue
        
        if self._llm is None:
            logger.error("LLM model not available")
            return None
        
        try:
            # Format prompt for Phi-3.5 (ChatML format)
            formatted_prompt = self._format_phi3_prompt(prompt, system_message)
            
            # Default stop tokens for Phi-3.5
            if stop is None:
                stop = ["<|end|>", "</s>", "\n\n\n"]
            
            # Generate response with lock - llama.cpp inference is NOT thread-safe for concurrent calls
            # We serialize inference calls to prevent segmentation faults
            with self._load_lock:  # Reuse the load lock for inference serialization
                response = self._llm(
                    formatted_prompt,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    stop=stop,
                    echo=False,  # Don't echo the prompt
                )
            
            # Extract generated text
            if response and 'choices' in response and len(response['choices']) > 0:
                generated_text = response['choices'][0]['text']
                return generated_text.strip()
            else:
                logger.warning("Empty response from LLM")
                return None
                
        except Exception as e:
            logger.error(f"Error generating text with LLM: {e}")
            return None
    
    def is_available(self) -> bool:
        """Check if LLM service is available"""
        return LLAMA_CPP_AVAILABLE and self._llm is not None
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the loaded model"""
        from app.config import settings
        
        if not LLAMA_CPP_AVAILABLE:
            return {
                "available": False,
                "error": "llama-cpp-python is not installed. Install with: pip install llama-cpp-python",
                "model_path": settings.llm_model_path,
                "model_type": "Phi-3.5 Mini 3.8B Q8_0"
            }
        
        if self._llm is None:
            import os
            model_exists = os.path.exists(settings.llm_model_path)
            error_msg = "Model not loaded"
            if not model_exists:
                error_msg = f"Model file not found at: {settings.llm_model_path}. Please download Phi-3.5 Mini model from: https://huggingface.co/bartowski/Phi-3.5-mini-instruct-GGUF"
            
            return {
                "available": False,
                "error": error_msg,
                "model_path": settings.llm_model_path,
                "model_type": "Phi-3.5 Mini 3.8B Q8_0",
                "model_exists": model_exists
            }
        
        return {
            "available": True,
            "model_path": settings.llm_model_path,
            "model_type": "Phi-3.5 Mini 3.8B Q8_0",
            "context_window": settings.llm_n_ctx,
            "cpu_threads": settings.llm_n_threads,
            "provider": "llama.cpp (direct inference)"
        }


# Global singleton instance (per process - fork-safe and thread-safe)
_llm_service = None
_process_id = None
_service_lock = threading.Lock()  # Lock for thread-safe singleton creation

def get_llm_service() -> LLMService:
    """
    Get or create the global LLM service instance.
    
    Fork-safe: Each Celery worker process gets its own instance.
    Thread-safe: Uses a lock to ensure only one instance is created per process.
    """
    global _llm_service, _process_id
    import os
    
    current_pid = os.getpid()
    
    # If process ID changed (fork happened), reset the service
    if _process_id != current_pid:
        with _service_lock:
            if _process_id != current_pid:  # Double-check
                _llm_service = None
                _process_id = current_pid
    
    if _llm_service is None:
        with _service_lock:
            # Double-check pattern: another thread might have created it
            if _llm_service is None:
                _llm_service = LLMService()
    
    return _llm_service

