"""
Summarization model - Enhanced version with improved features.
This is the main summarization model that should be used.
"""

# Import the enhanced model as the default
from app.services.enhanced_summarization_model import EnhancedSummarizationModel as SummarizationModel

# Export for easy import
__all__ = ['SummarizationModel']
