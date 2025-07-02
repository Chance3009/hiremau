"""
Candidate Sourcing Root Agent

This module defines the root agent for candidate profile enrichment.
It uses a parallel agent for data gathering and a sequential pipeline 
for the overall workflow.
"""

from google.adk.agents import ParallelAgent, SequentialAgent

from .candidate_sourcing.linkedin_agent import linkedin_agent
from .candidate_sourcing.github_agent import github_agent
from .candidate_sourcing.website_agent import website_agent
from .candidate_sourcing.synthesizer_agent import synthesizer_agent

# --- 1. Create Parallel Agent to gather candidate information concurrently ---
candidate_data_gatherer = ParallelAgent(
    name="candidate_data_gatherer",
    sub_agents=[linkedin_agent, github_agent, website_agent],
)

# --- 2. Create Sequential Pipeline to gather data in parallel, then synthesize ---
source_agent= SequentialAgent(
    name="candidate_sourcing_agent",
    sub_agents=[candidate_data_gatherer, synthesizer_agent],
)
