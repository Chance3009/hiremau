"""
Candidate Sourcing Root Agent

This module defines the root agent for candidate profile enrichment.
It uses a parallel agent for data gathering and a sequential pipeline 
for the overall workflow.
"""

from google.adk.agents import ParallelAgent

from .candidate_sourcing.linkedin_agent import linkedin_agent
from .candidate_sourcing.github_agent import github_agent
from .candidate_sourcing.website_agent import website_agent

# --- 1. Create Parallel Agent to gather candidate information concurrently ---
source_agent = ParallelAgent(
    name="candidate_data_gatherer",
    sub_agents=[linkedin_agent, github_agent, website_agent]
)
