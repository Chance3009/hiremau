"""
LinkedIn Agent

This agent is responsible for gathering and analyzing LinkedIn profile information.
"""

from google.adk.agents import LlmAgent
from google.adk.tools.mcp_tool.mcp_toolset import MCPToolset, StdioServerParameters
import os
from dotenv import load_dotenv

load_dotenv()

# Check if BrightData API token is available
api_token = os.getenv("API_TOKEN")
if not api_token:
    print("WARNING: API_TOKEN not found in environment variables")
    print("LinkedIn agent will not function properly without BrightData API token")

# Initialize BrightData MCP tools for LinkedIn with error handling
try:
    mcp_tools = MCPToolset(
        connection_params=StdioServerParameters(
            command='npx',
            args=["-y", "@brightdata/mcp"],
            env={
                "API_TOKEN": api_token,
                "WEB_UNLOCKER_ZONE": os.getenv("WEB_UNLOCKER_ZONE", "")
            }
        )
    )
except Exception as e:
    print(
        f"ERROR: Failed to initialize BrightData MCP tools for LinkedIn: {e}")
    print("LinkedIn agent will not function properly")
    mcp_tools = None

# LinkedIn Information Agent
linkedin_agent = LlmAgent(
    name="LinkedInAgent",
    model="gemini-2.0-flash",
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

IF API_TOKEN NOT AVAILABLE:
Return exactly: "LinkedIn data extraction failed - API token not configured"

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
    tools=[mcp_tools] if mcp_tools else [],
    output_key="linkedin_data",
)
