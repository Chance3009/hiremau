"""Candidate Sourcing Agent - ADK Agent for enriching candidate profiles."""

from .agent import root_agent

# Export for ADK discovery
__version__ = "1.0.0"
__all__ = ["root_agent"]
