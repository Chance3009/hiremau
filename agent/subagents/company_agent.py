from google.adk.agents import Agent

def search_knowledge_base(query: str) -> str:
    """
    Search the knowledge base and return raw chunks for the agent to analyze.
    Args:
        query (str): Search query.
    Returns:
        str: Raw chunks from the knowledge base.
    """
    from company.retrieve_company import similarity_search
    try:
        documents = similarity_search(query)
        if not documents:
            return "No relevant information found in the knowledge base."
        chunks = []
        chunks.append(f"Search Results for: '{query}'\nFound {len(documents)} relevant chunks:\n")
        for i, doc in enumerate(documents, 1):
            chunks.append(f"Result {i}:\n{doc}")
        return "\n\n" + "="*50 + "\n\n".join(chunks)
    except Exception as e:
        return f"Error searching knowledge base: {str(e)}"

# Define the agent
company_agent = Agent(
    name="company_agent",
    model="gemini-2.0-flash-exp",
    description="RAG agent that retrieves raw document chunks about company information and job openings and processes them using its own reasoning capabilities.",
    instruction="""
    You are an intelligent RAG agent tool specialized in company information, job openings and employment information. You have access to a knowledge base containing relevant documents.

    Your approach:
    1. When the main agant ask questions, use the search tools to retrieve raw document chunks
    2. Analyze and synthesize the information from these chunks using your own reasoning
    3. Provide comprehensive, accurate answers based on the retrieved content as fast as possible

    Available tools:
    - search_knowledge_base: Tool for general queries 

    Guidelines:
    - Always retrieve relevant chunks first before answering
    - Synthesize information across multiple chunks when needed
    - If no relevant information is found, be honest about it
    - Provide clear, concise, and helpful responses
    """,
    tools=[
        search_knowledge_base,     # Search tool
    ],
)