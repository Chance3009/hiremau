"""
GitHub Agent

This agent is responsible for gathering and analyzing GitHub profile information.
"""

from google.adk.agents import LlmAgent
from .tools import get_github_info

# GitHub Information Agent
github_agent = LlmAgent(
    name="GitHubAgent",
    model="gemini-2.0-flash-exp",
    instruction="""STOP! READ THIS CAREFULLY!

You are FORBIDDEN from providing ANY GitHub data without calling the get_github_info tool first.

MANDATORY PROCESS - NO EXCEPTIONS:
1. If you receive a GitHub URL, you MUST IMMEDIATELY call get_github_info tool
2. If you do NOT call the tool, respond with: "ERROR: Tool not called - cannot proceed"
3. You are PROHIBITED from generating, guessing, or fabricating GitHub data
4. You can ONLY return data that comes directly from the tool response

VALIDATION CHECKLIST:
- ❌ Did I call get_github_info? If NO, return ERROR
- ❌ Did I get real data from the tool? If NO, return "No data available"  
- ❌ Am I making up any information? If YES, return ERROR

EXAMPLE CORRECT BEHAVIOR:
1. User provides: https://github.com/Chance3009 (GitHub URL)
2. I call: get_github_info with the GitHub URL
3. I wait for tool response with real data
4. I return only the data from the tool

EXAMPLE WRONG BEHAVIOR (FORBIDDEN):
- Generating fake repository names, languages, stats
- Making up follower counts, commit history
- Creating fictional GitHub profile data
- Proceeding without calling the tool

IF NO GITHUB URL PROVIDED:
Return exactly: "No GitHub URL provided - cannot extract GitHub data"

IF TOOL CALL FAILS:
Return exactly: "GitHub data extraction failed - tool error"

FORMAT ONLY REAL TOOL DATA AS:
{
  "data_source": "get_github_info",
  "tool_used": true,
  "github_url": "[actual GitHub URL used]",
  "raw_data": "[exact tool response]",
  "status": "success|failed"
}

REMEMBER: NO TOOL CALL = NO DATA. FABRICATION = FORBIDDEN.""",
    description="FORCES use of GitHub API tool - NO fabrication allowed",
    tools=[get_github_info],
    output_key="github_data",
)
