from google.adk.agents import Agent
import os
import sys

# Add the parent directory to the path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from candidate_rag.rag import RAGSystem

# Initialize RAG system (pure vector database, no LLM)
rag = RAGSystem()

def search_knowledge_base(query: str, num_results: int = 4) -> str:
    """
    Search the knowledge base and return raw chunks for the agent to analyze.
    
    Args:
        query (str): Search query.
        num_results (int): Number of results to return.
        
    Returns:
        str: Raw chunks from the knowledge base.
    """
    try:
        if rag.db is None:
            return "Knowledge base not initialized. Please update the database first."
        
        # Get relevant documents/chunks from the vector database
        documents = rag.query_database(query, k=num_results)
        
        if not documents:
            return "No relevant information found in the knowledge base."
        
        # Format chunks for the agent with search context
        chunks = []
        chunks.append(f"Search Results for: '{query}'\nFound {len(documents)} relevant chunks:\n")
        
        for i, doc in enumerate(documents, 1):
            # Include metadata if available
            metadata_info = ""
            if hasattr(doc, 'metadata') and doc.metadata:
                metadata_info = f" (Source: {doc.metadata.get('source', 'Unknown')})"
            
            chunks.append(f"Result {i}{metadata_info}:\n{doc.page_content}")
        
        return "\n\n" + "="*50 + "\n\n".join(chunks)
        
    except Exception as e:
        return f"Error searching knowledge base: {str(e)}"

def get_database_info() -> str:
    """
    Get information about the current database status.
    
    Returns:
        str: Database status information.
    """
    try:
        return rag.get_database_info()
    except Exception as e:
        return f"Error getting database info: {str(e)}"

candidate_agent = Agent(
    name="candidate_agent",
    model="gemini-2.0-flash-exp",
    description="RAG agent that retrieves raw document chunks about candidates or applicants and processes them using its own reasoning capabilities.",
    instruction="""
    You are an intelligent RAG agent tool specialized in candidate and applicants information. You have access to a knowledge base containing relevant documents.

    Your approach:
    1. When the main agant ask questions, use the search tools to retrieve raw document chunks
    2. Analyze and synthesize the information from these chunks using your own reasoning
    3. Provide comprehensive, accurate answers based on the retrieved content as fast as possible

    Available tools:
    - search_knowledge_base: Tool for general queries 
    - get_database_info: Check knowledge base status

    Guidelines:
    - Always retrieve relevant chunks first before answering
    - Synthesize information across multiple chunks when needed
    - If no relevant information is found, be honest about it
    - Provide clear, concise, and helpful responses
    """,
    tools=[
        search_knowledge_base,     # Search tool
        get_database_info,         # Database status
    ],
)