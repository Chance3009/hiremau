# Candidate Sourcing Agent - ADK Parallel Agent Architecture

A professional candidate sourcing agent built with **ADK's native ParallelAgent architecture** using Google's Agent Development Kit (ADK) v1.2.0+ and Bright Data's Model Context Protocol (MCP). This agent uses proper ADK workflow patterns for concurrent candidate profile enrichment.

## 🚀 **Native ADK Parallel Architecture**

**Proper ADK Implementation**: Uses ADK's built-in `ParallelAgent` and `SequentialAgent`:

```
User Request → SequentialAgent (Root)
                ├── ParallelAgent (Data Gatherer)
                │    ├── LinkedInAgent  (BrightData MCP)
                │    ├── GitHubAgent    (GitHub API)  
                │    └── WebsiteAgent   (BrightData MCP)
                └── SynthesizerAgent (Combines Results)
```

### 🎯 **Key ADK Pattern**
```python
# Parallel data gathering
candidate_data_gatherer = ParallelAgent(
    name="candidate_data_gatherer",
    sub_agents=[linkedin_agent, github_agent, website_agent],
)

# Sequential workflow: parallel gathering → synthesis
root_agent = SequentialAgent(
    name="candidate_sourcing_agent",
    sub_agents=[candidate_data_gatherer, candidate_profile_synthesizer],
)
```

## ⚡ **Why ADK's ParallelAgent?**

| Feature | Custom Async | **ADK ParallelAgent** |
|---------|-------------|----------------------|
| Implementation | Complex async/await | **Simple agent composition** |
| Error Handling | Manual try/catch | **Built-in ADK handling** |
| Performance | Good | **Optimized by ADK** |
| Maintenance | High | **Low - ADK managed** |
| ADK Integration | Workaround | **Native support** |

## 🎯 **Specialized Sub-Agents**

### 1. **LinkedInAgent**
```python
linkedin_agent = LlmAgent(
    name="LinkedInAgent",
    tools=[mcp_tools],  # BrightData MCP
    output_key="linkedin_data"
)
```
- **Tool**: `web_data_linkedin_person_profile` (BrightData MCP)
- **Purpose**: Professional background, skills, work history
- **Output**: Structured LinkedIn profile data

### 2. **GitHubAgent** 
```python
github_agent = LlmAgent(
    name="GitHubAgent", 
    tools=[get_github_info],  # Custom GitHub API tool
    output_key="github_data"
)
```
- **Tool**: GitHub Public API (via custom tool function)
- **Purpose**: Technical projects, programming languages, contributions
- **Output**: Repository analysis and coding metrics

### 3. **WebsiteAgent**
```python
website_agent = LlmAgent(
    name="WebsiteAgent",
    tools=[mcp_tools],  # BrightData MCP
    output_key="website_data"
)
```
- **Tool**: `scrape_as_markdown` (BrightData MCP)
- **Purpose**: Personal websites, portfolios, blog content
- **Output**: Bio, projects, contact information

### 4. **SynthesizerAgent**
```python
candidate_profile_synthesizer = LlmAgent(
    name="CandidateProfileSynthesizer",
    tools=[]  # No tools - uses input from other agents
)
```
- **Purpose**: Combines all agent outputs into comprehensive profile
- **Input**: `{linkedin_data}`, `{github_data}`, `{website_data}`
- **Output**: Complete candidate assessment with recommendations

## 🎯 **Usage**

### **Entry Point: Standard ADK Commands**
```powershell
# Run with CLI interface
adk run candidate_sourcing_agent

# Run with web interface  
adk web candidate_sourcing_agent
```

### **Example User Interactions**

**Single Source:**
```
User: "Enrich profile for Linus Torvalds with GitHub username: torvalds"
→ GitHubAgent processes in parallel
→ Synthesizer creates comprehensive assessment
```

**Multiple Sources:**
```
User: "Analyze John Doe: LinkedIn linkedin.com/in/johndoe, GitHub: johndoe, website: johndoe.dev"
→ All three agents run simultaneously via ParallelAgent
→ Synthesizer combines results into unified profile
```

**Natural Language:**
```
User: "Get candidate data for Jane Smith"
→ System prompts for specific URLs/usernames
→ Available agents process provided information
```

## 📋 **Prerequisites**

1. **Python 3.10+**
2. **Node.js 16+** (for npx command)
3. **Google API Key** - Get from [Google AI Studio](https://aistudio.google.com/app/apikey)
4. **Bright Data Account** - Sign up at [Bright Data](https://brightdata.com/)
5. **GitHub Token** (Optional) - For higher API rate limits

## 🛠️ **Installation**

### 1. Clone the Repository
```powershell
git clone https://github.com/your-username/sourcing_agent.git
cd sourcing_agent
```

### 2. Set Up Virtual Environment  
```powershell
# Windows PowerShell
python -m venv venv
venv\Scripts\Activate.ps1

# Install dependencies
pip install google-adk python-dotenv requests rich pydantic
```

### 3. Install Bright Data MCP Server
```powershell
npm install -g @brightdata/mcp
```

### 4. Environment Configuration
Copy `env_template.txt` to `.env` and configure:
```bash
# Google API Key from https://aistudio.google.com/app/apikey
GOOGLE_API_KEY="your_google_api_key_here"

# Bright Data credentials from https://brightdata.com/cp/zones  
API_TOKEN="your_brightdata_api_token"
WEB_UNLOCKER_ZONE="your_web_unlocker_zone"

# Optional: GitHub token for higher rate limits
GITHUB_TOKEN="your_github_personal_access_token"
```

## 🎯 **Running & Testing**

### **Standard ADK Commands**
```powershell
# Interactive CLI
adk run candidate_sourcing_agent

# Web interface
adk web candidate_sourcing_agent
```

### **Test ADK Structure**
```powershell
# Test the parallel agent structure
python test_adk_parallel.py

# Test GitHub integration
python -m candidate_sourcing_agent.cli --name "Linus Torvalds" --github "torvalds" --verbose
```

## 📁 **Project Structure**

```
sourcing_agent/
├── candidate_sourcing_agent/
│   ├── __init__.py               # ADK agent export
│   ├── agent.py                  # Main ParallelAgent + SequentialAgent
│   │
│   ├── subagents/               # Specialized sub-agents
│   │   ├── __init__.py          # Sub-agent exports
│   │   │
│   │   ├── linkedin_agent/      # LinkedIn data gathering
│   │   │   ├── __init__.py
│   │   │   └── agent.py         # LlmAgent with MCP tools
│   │   │
│   │   ├── github_agent/        # GitHub data gathering  
│   │   │   ├── __init__.py
│   │   │   ├── agent.py         # LlmAgent with GitHub API
│   │   │   └── tools.py         # GitHub API functions
│   │   │
│   │   ├── website_agent/       # Website content extraction
│   │   │   ├── __init__.py
│   │   │   └── agent.py         # LlmAgent with MCP tools
│   │   │
│   │   └── synthesizer_agent/   # Result combination
│   │       ├── __init__.py
│   │       └── agent.py         # LlmAgent for synthesis
│   │
│   ├── models.py                # Data models (legacy)
│   ├── github_api.py            # GitHub API integration
│   └── cli.py                   # CLI testing interface
│
├── test_adk_parallel.py         # ADK structure test
├── env_template.txt             # Environment template
├── requirements.txt             # Dependencies
└── README.md
```

## 🔍 **Sample Output**

```json
{
  "candidate_name": "Linus Torvalds",
  "sources_analyzed": ["github", "linkedin"],
  "executive_summary": "Highly accomplished software engineer and creator of Linux kernel...",
  "professional_background": {
    "current_role": "Chief Architect at Linux Foundation",
    "experience_level": "Senior/Expert",
    "career_progression": "Consistent leadership in open source development"
  },
  "technical_profile": {
    "primary_skills": ["C Programming", "Operating Systems", "Linux Kernel"],
    "programming_languages": ["C", "Shell", "Assembly"],
    "notable_projects": [
      {
        "name": "linux",
        "description": "Linux kernel source tree",
        "stars": 150000,
        "language": "C"
      }
    ],
    "github_activity_level": "High impact, focused contributions"
  },
  "authenticity_score": "high",
  "authenticity_reasoning": "Consistent data across sources, verified technical contributions",
  "hiring_recommendation": {
    "overall_rating": "strong",
    "reasoning": "Exceptional technical leadership and proven track record",
    "next_steps": "Proceed with technical architecture interview"
  }
}
```

## 🏆 **ADK Architecture Advantages**

### **Native ADK Benefits:**
- ✅ **Built-in Parallel Execution** - Uses ADK's optimized ParallelAgent
- ✅ **Proper Error Handling** - ADK manages failures gracefully
- ✅ **Clean Agent Composition** - Simple, declarative agent structure
- ✅ **Tool Specialization** - Each agent focused on one data source
- ✅ **Easy Testing** - Individual agents can be tested independently
- ✅ **ADK Best Practices** - Follows official ADK patterns

### **vs. Custom Implementation:**
- ✅ **Less Code** - No custom async orchestration needed
- ✅ **Better Reliability** - ADK handles edge cases
- ✅ **Easier Maintenance** - Standard ADK patterns
- ✅ **Performance Optimized** - ADK's parallel execution is optimized

## 🎮 **User Experience**

Users interact with a single agent that:
1. **Accepts** flexible candidate information (name + URLs/usernames)
2. **Runs** specialized agents in parallel automatically
3. **Combines** all results into a comprehensive assessment
4. **Provides** structured hiring recommendations

The ADK handles all parallel execution, error handling, and result combination seamlessly.

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 **Additional Resources**

- **ADK Parallel Agents**: [Documentation](https://google.github.io/adk-docs/agents/workflow-agents/parallel-agents/)
- **Google ADK**: [Agent Development Kit](https://google.github.io/adk-docs/)
- **Bright Data MCP**: [MCP Server Documentation](https://github.com/brightdata/brightdata-mcp)
- **Model Context Protocol**: [MCP Specification](https://modelcontextprotocol.io/)

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 **Author**

**Arjun Prabhulal**
- Medium: [@arjun-prabhulal](https://arjun-prabhulal.medium.com/)
- GitHub: [@arjunprabhulal](https://github.com/arjunprabhulal)

