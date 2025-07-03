"""
LinkedIn Agent

This agent is responsible for gathering and analyzing LinkedIn profile information.
"""

from google.adk.agents import LlmAgent
from google.adk.tools.mcp_tool.mcp_toolset import MCPToolset, StdioServerParameters
import os
from dotenv import load_dotenv

load_dotenv()

from dotenv import load_dotenv
load_dotenv()

api_token = os.getenv("API_TOKEN")
web_unlocker_zone = os.getenv("WEB_UNLOCKER_ZONE")

print("API_TOKEN:", api_token)
print("WEB_UNLOCKER_ZONE:", web_unlocker_zone)

# Initialize BrightData MCP tools for LinkedIn
mcp_tools = MCPToolset(
    connection_params=StdioServerParameters(
        command='npx',
        args=["-y", "@brightdata/mcp"],
        env={
            "API_TOKEN": os.getenv("API_TOKEN"),
            "WEB_UNLOCKER_ZONE": os.getenv("WEB_UNLOCKER_ZONE")
        }
    )
)

# LinkedIn Information Agent
linkedin_agent = LlmAgent(
    name="LinkedInAgent",
    model="gemini-2.0-flash-exp",
    instruction="""STOP! READ THIS CAREFULLY!

You are FORBIDDEN from providing ANY LinkedIn data without calling the web_data_linkedin_person_profile tool first.

MANDATORY PROCESS - NO EXCEPTIONS:
1. If you receive a LinkedIn URL, you MUST IMMEDIATELY call web_data_linkedin_person_profile tool
2. If you do NOT call the tool, respond with: "ERROR: Tool not called - cannot proceed"
3. You are PROHIBITED from generating, guessing, or fabricating LinkedIn data
4. You can ONLY return data that comes directly from the tool response

VALIDATION CHECKLIST:
- ❌ Did I call web_data_linkedin_person_profile? If NO, return ERROR
- ❌ Did I get real data from the tool? If NO, return "No data available"  
- ❌ Am I making up any information? If YES, return ERROR

EXAMPLE CORRECT BEHAVIOR:
1. User provides: https://www.linkedin.com/in/someone
2. I call: web_data_linkedin_person_profile with URL
3. I wait for tool response with real data
4. I return only the data from the tool

EXAMPLE WRONG BEHAVIOR (FORBIDDEN):
- Generating fake names, positions, companies
- Making up connection counts, experience
- Creating fictional LinkedIn data
- Proceeding without calling the tool

IF NO LINKEDIN URL PROVIDED:
Return exactly: "No LinkedIn URL provided - cannot extract LinkedIn data"

IF TOOL CALL FAILS:
Return exactly: "LinkedIn data extraction failed - tool error"

FORMAT ONLY REAL TOOL DATA AS:
{
  "data_source": "web_data_linkedin_person_profile",
  "tool_used": true,
  "url": "[actual URL used]",
  "raw_data": "[exact tool response]",
  "status": "success|failed"
}

REMEMBER: NO TOOL CALL = NO DATA. FABRICATION = FORBIDDEN.""",
    description="FORCES use of BrightData MCP tools - NO fabrication allowed",
    tools=[mcp_tools],
    output_key="linkedin_data",
)
