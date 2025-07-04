from google.adk.agents import Agent

def search_knowledge_base(query: str) -> str:
    """
    Search the knowledge base and return raw chunks for the agent to analyze.
    Args:
        query (str): Search query.
    Returns:
        str: Raw chunks from the knowledge base.
    """
    from candidate.retrieve_candidate import similarity_search
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

def add_candidate_document(name: str, url: str, uuid: str) -> dict:
    from candidate.add_candidate import add_candidate_document
    return add_candidate_document(name, url, uuid)

candidate_agent = Agent(
    name="candidate_agent",
    model="gemini-2.0-flash",
    description="An agent tool that can add candidate documents to the database and retrieve RAG chunks from the database.",
    instruction="""
    You are an intelligent RAG agent tool specialized in candidate and applicants information. You have access to a knowledge base containing relevant documents. You can also add candidate documents to the database and retrieve RAG chunks from the database.

    Your approach if the main agent ask you regarding candidate information:
    1. When the main agant ask questions, use the search tools to retrieve raw document chunks
    2. Analyze and synthesize the information from these chunks using your own reasoning
    3. Provide comprehensive, accurate answers based on the retrieved content as fast as possible

    Your approach if the main agent ask you to add a candidate document to the database:
    1. Use the add_candidate_document tool by passing the name, url, and uuid from the main agent to add the document to the database.
    2. You will receive a JSON response from the add_candidate_document tool. If the response is successful, read the content of the response.
    3. In your response, mention the name of the candidate and mention the full URL if there is any social media information provided. If not, reply "No social media information provided". Do not say anything else.

    Available tools:
    - search_knowledge_base: Tool for general queries 
    - add_candidate_document: Tool for adding candidate documents to the database

    Guidelines:
    - Be clear on what the main agent is asking you to do.
    - Always retrieve relevant chunks first before answering
    - Synthesize information across multiple chunks when needed
    - If no relevant information is found, be honest about it
    - Provide clear, concise, and helpful responses
    """,
    tools=[
        search_knowledge_base,     # Search tool
        add_candidate_document,    # Add candidate document tool
    ],
)