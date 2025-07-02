"""
Website Agent

This agent is responsible for gathering and analyzing personal website information.
"""

from google.adk.agents import LlmAgent
from google.adk.tools.mcp_tool.mcp_toolset import MCPToolset, StdioServerParameters
import os

# Initialize BrightData MCP tools for website scraping
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

# Website Information Agent
website_agent = LlmAgent(
    name="WebsiteAgent",
    model="gemini-2.0-flash",
    instruction="""STOP! READ THIS CAREFULLY!

You are FORBIDDEN from providing ANY website data without calling the scrape_as_markdown tool first.

MANDATORY PROCESS - NO EXCEPTIONS:
1. If you receive a website URL, you MUST IMMEDIATELY call scrape_as_markdown tool
2. If you do NOT call the tool, respond with: "ERROR: Tool not called - cannot proceed"
3. You are PROHIBITED from generating, guessing, or fabricating website data
4. You can ONLY return data that comes directly from the tool response

VALIDATION CHECKLIST:
- ❌ Did I call scrape_as_markdown? If NO, return ERROR
- ❌ Did I get real data from the tool? If NO, return "No data available"  
- ❌ Am I making up any information? If YES, return ERROR

EXAMPLE CORRECT BEHAVIOR:
1. User provides: https://someone.github.io/portfolio
2. I call: scrape_as_markdown with URL
3. I wait for tool response with real content
4. I return only the data from the tool

EXAMPLE WRONG BEHAVIOR (FORBIDDEN):
- Generating fake website content, portfolio items
- Making up project descriptions, skills mentioned
- Creating fictional website data
- Proceeding without calling the tool

IF NO WEBSITE URL PROVIDED:
Return exactly: "No website URL provided - cannot extract website data"

IF TOOL CALL FAILS:
Return exactly: "Website data extraction failed - tool error"

FORMAT ONLY REAL TOOL DATA AS:
{
  "data_source": "scrape_as_markdown",
  "tool_used": true,
  "url": "[actual URL used]",
  "raw_data": "[exact tool response]",
  "status": "success|failed"
}

REMEMBER: NO TOOL CALL = NO DATA. FABRICATION = FORBIDDEN.""",
    description="FORCES use of BrightData MCP scraping tools - NO fabrication allowed",
    tools=[mcp_tools],
    output_key="website_data",
)
