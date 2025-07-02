import os
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_ollama import OllamaEmbeddings

class RAGSystem:
    def __init__(self, data_path="pdf", persist_directory="./company_db", 
                 embedding_model="nomic-embed-text"):
        """
        Initialize the RAG system.
        
        Args:
            data_path (str): Path to the directory containing PDF files
            persist_directory (str): Path where the vector database will be stored
            embedding_model (str): Ollama embedding model name
        """
        # Get the directory where this script is located
        script_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Make paths relative to the script directory
        self.data_path = os.path.join(script_dir, data_path)
        self.persist_directory = os.path.join(script_dir, persist_directory)
        self.embedding_model = embedding_model
        
        # Initialize components
        self.embeddings = OllamaEmbeddings(model=self.embedding_model)
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000, 
            chunk_overlap=200
        )
        
        # Initialize vector database
        self.db = None
        self._initialize_database()
    
    def _initialize_database(self):
        """Initialize or load existing vector database."""
        if os.path.exists(self.persist_directory):
            # Load existing database
            self.db = Chroma(
                persist_directory=self.persist_directory,
                embedding_function=self.embeddings
            )
            print(f"Loaded existing database from {self.persist_directory}")
        else:
            # Create new database if PDF directory exists
            if os.path.exists(self.data_path):
                print(f"Creating new database from PDFs in {self.data_path}")
                self.update_database()
            else:
                print(f"Warning: Data path {self.data_path} does not exist. Database will be empty.")
                self.db = Chroma(
                    persist_directory=self.persist_directory,
                    embedding_function=self.embeddings
                )
    
    def update_database(self):
        """Update the vector database with new PDFs from the data directory."""
        try:
            if not os.path.exists(self.data_path):
                print(f"Error: Data path {self.data_path} does not exist.")
                return False
            
            # Load PDFs
            loader = PyPDFDirectoryLoader(self.data_path)
            docs = loader.load()
            
            if not docs:
                print(f"No PDF documents found in {self.data_path}")
                return False
            
            print(f"Loaded {len(docs)} PDF documents")
            
            # Split documents into chunks
            chunks = self.text_splitter.split_documents(docs)
            print(f"Split into {len(chunks)} chunks")
            
            # Delete existing database if it exists
            if self.db is not None:
                try:
                    self.db.delete_collection()
                    print("Deleted existing database")
                except:
                    pass
            
            # Create fresh database
            self.db = Chroma.from_documents(
                chunks, 
                self.embeddings,
                persist_directory=self.persist_directory
            )
            print("Created fresh vector database")
            print("Database updated successfully")
            return True
            
        except Exception as e:
            print(f"Error updating database: {str(e)}")
            return False
    
    def get_relevant_documents(self, question, k=4):
        """
        Retrieve relevant documents based on the question.
        
        Args:
            question (str): The question to search for
            k (int): Number of documents to retrieve
            
        Returns:
            list: List of relevant documents, or empty list if failed
        """
        try:
            if self.db is None:
                print("Error: Database not initialized. Please update the database first.")
                return []
            
            retriever = self.db.as_retriever(search_kwargs={"k": k})
            documents = retriever.invoke(question)
            return documents
            
        except Exception as e:
            print(f"Error retrieving documents: {str(e)}")
            return []
    
    def get_database_info(self):
        """Get information about the current database."""
        if self.db is None:
            return "Database not initialized"
        
        try:
            collection = self.db._collection
            count = collection.count()
            return f"Database contains {count} document chunks"
        except:
            return "Database information not available"