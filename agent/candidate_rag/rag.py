import os
import io
import base64
from pathlib import Path
from typing import Dict, List, Optional
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_ollama import OllamaEmbeddings, ChatOllama
from langchain.schema import Document
from langchain.prompts import ChatPromptTemplate
from PIL import Image

class RAGSystem:
    def __init__(self, 
                 pdf_path: str = "documents", 
                 images_path: str = "documents",
                 persist_directory: str = "./candidate_db",
                 embedding_model: str = "nomic-embed-text",
                 ocr_model: str = "llava:13b"):
        """
        Initialize the Document RAG system for PDFs and Images.
        
        Args:
            pdf_path (str): Path to the directory containing PDF files
            images_path (str): Path to the directory containing image files
            persist_directory (str): Path where the vector database will be stored
            embedding_model (str): Ollama embedding model name
            ocr_model (str): Ollama OCR model name
        """
        # Get the directory where this script is located
        script_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Make paths relative to the script directory
        self.pdf_path = os.path.join(script_dir, pdf_path)
        self.images_path = os.path.join(script_dir, images_path)
        self.persist_directory = os.path.join(script_dir, persist_directory)
        self.embedding_model = embedding_model
        self.ocr_model = ocr_model
        
        # Supported image extensions
        self.image_extensions = {'.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.tif', '.webp'}
        
        # Initialize components
        self.embeddings = OllamaEmbeddings(model=self.embedding_model)
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000, 
            chunk_overlap=200
        )
        
        # Initialize OCR components
        self.ocr_llm = ChatOllama(model=self.ocr_model)
        self.ocr_prompt = ChatPromptTemplate.from_messages([
            ("system", "Perform Optical Character Recognition (OCR) on the following image data. The output should be the extracted text formatted in Markdown."),
            ("user", [{"type": "image_url", "image_url": {"url": "data:image/jpeg;base64,{image_data}"}}])
        ])
        
        # Initialize vector database
        self.db = None
        self._initialize_database()
    
    def _initialize_database(self):
        """Initialize or load existing vector database."""
        if os.path.exists(self.persist_directory):
            try:
                self.db = Chroma(
                    persist_directory=self.persist_directory,
                    embedding_function=self.embeddings
                )
                print(f"Loaded existing database from {self.persist_directory}")
                print(self.get_database_info())
            except Exception as e:
                print(f"Error loading database: {e}")
                self._create_empty_database()
        else:
            self._create_empty_database()
    
    def _create_empty_database(self):
        """Create an empty vector database."""
        self.db = Chroma(
            persist_directory=self.persist_directory,
            embedding_function=self.embeddings
        )
        print(f"Created empty database at {self.persist_directory}")
    
    def _is_image_file(self, filename: str) -> bool:
        """Check if file is an image based on its extension."""
        return Path(filename).suffix.lower() in self.image_extensions
    
    def _read_image_as_base64(self, image_filename: str) -> str:
        """Convert image file to base64 string."""
        with Image.open(image_filename) as img:
            buf = io.BytesIO()
            img.save(buf, format="PNG")
            return base64.b64encode(buf.getvalue()).decode("utf-8")
    
    def _extract_text_from_image(self, image_path: str) -> Optional[str]:
        """Extract text from a single image using OCR."""
        try:
            print(f"Processing image: {os.path.basename(image_path)}")
            image_data = self._read_image_as_base64(image_path)
            chain = self.ocr_prompt | self.ocr_llm
            result = chain.invoke({"image_data": image_data})
            return result.content
        except Exception as e:
            print(f"Error processing image {image_path}: {str(e)}")
            return None
    
    def _load_pdf_documents(self) -> List[Document]:
        """Load all PDF documents from the PDF directory."""
        documents = []
        if not os.path.exists(self.pdf_path):
            print(f"PDF path {self.pdf_path} does not exist.")
            return documents
        
        try:
            loader = PyPDFDirectoryLoader(self.pdf_path)
            pdf_docs = loader.load()
            print(f"Loaded {len(pdf_docs)} PDF documents from {self.pdf_path}")
            documents.extend(pdf_docs)
        except Exception as e:
            print(f"Error loading PDFs: {str(e)}")
        
        return documents
    
    def _load_image_documents(self) -> List[Document]:
        """Load and process all image documents from the images directory."""
        documents = []
        if not os.path.exists(self.images_path):
            print(f"Images path {self.images_path} does not exist.")
            return documents
        
        try:
            files = os.listdir(self.images_path)
            image_files = [f for f in files if self._is_image_file(f)]
            
            if not image_files:
                print(f"No image files found in {self.images_path}")
                return documents
            
            print(f"Found {len(image_files)} image files in {self.images_path}")
            
            for image_file in image_files:
                image_path = os.path.join(self.images_path, image_file)
                extracted_text = self._extract_text_from_image(image_path)
                
                if extracted_text:
                    # Create a Document object for the extracted text
                    doc = Document(
                        page_content=extracted_text,
                        metadata={
                            "source": image_path,
                            "type": "image_ocr",
                            "filename": image_file
                        }
                    )
                    documents.append(doc)
                    print(f"✓ Successfully processed: {image_file}")
                else:
                    print(f"✗ Failed to process: {image_file}")
            
        except Exception as e:
            print(f"Error processing images: {str(e)}")
        
        return documents
    
    def update_database(self, include_pdfs: bool = True, include_images: bool = True):
        """
        Update the vector database with documents from PDF and/or image directories.
        
        Args:
            include_pdfs (bool): Whether to include PDF documents
            include_images (bool): Whether to include image documents
        """
        try:
            all_documents = []
            
            # Load PDF documents
            if include_pdfs:
                pdf_docs = self._load_pdf_documents()
                all_documents.extend(pdf_docs)
            
            # Load image documents
            if include_images:
                image_docs = self._load_image_documents()
                all_documents.extend(image_docs)
            
            if not all_documents:
                print("No documents found to process.")
                return False
            
            print(f"Total documents loaded: {len(all_documents)}")
            
            # Split documents into chunks
            chunks = self.text_splitter.split_documents(all_documents)
            print(f"Split into {len(chunks)} chunks")
            
            # Delete existing database if it exists
            if self.db is not None:
                try:
                    self.db.delete_collection()
                    print("Deleted existing database")
                except Exception as e:
                    print(f"Note: Could not delete existing collection: {e}")
            
            # Create fresh database
            self.db = Chroma.from_documents(
                chunks, 
                self.embeddings,
                persist_directory=self.persist_directory
            )
            
            print("✓ Database updated successfully")
            print(self.get_database_info())
            return True
            
        except Exception as e:
            print(f"Error updating database: {str(e)}")
            return False
    
    def add_documents_to_database(self, include_pdfs: bool = True, include_images: bool = True):
        """
        Add new documents to existing database without deleting existing content.
        
        Args:
            include_pdfs (bool): Whether to include PDF documents
            include_images (bool): Whether to include image documents
        """
        try:
            all_documents = []
            
            # Load PDF documents
            if include_pdfs:
                pdf_docs = self._load_pdf_documents()
                all_documents.extend(pdf_docs)
            
            # Load image documents
            if include_images:
                image_docs = self._load_image_documents()
                all_documents.extend(image_docs)
            
            if not all_documents:
                print("No documents found to add.")
                return False
            
            print(f"Total documents to add: {len(all_documents)}")
            
            # Split documents into chunks
            chunks = self.text_splitter.split_documents(all_documents)
            print(f"Split into {len(chunks)} chunks")
            
            # Add to existing database
            if self.db is None:
                self._create_empty_database()
            
            self.db.add_documents(chunks)
            print("✓ Documents added to database successfully")
            print(self.get_database_info())
            return True
            
        except Exception as e:
            print(f"Error adding documents to database: {str(e)}")
            return False
    
    def query_database(self, question: str, k: int = 4) -> List[Document]:
        """
        Query the vector database for relevant documents.
        
        Args:
            question (str): The question to search for
            k (int): Number of documents to retrieve
            
        Returns:
            List[Document]: List of relevant documents
        """
        try:
            if self.db is None:
                print("Error: Database not initialized. Please update the database first.")
                return []
            
            retriever = self.db.as_retriever(search_kwargs={"k": k})
            documents = retriever.invoke(question)
            
            print(f"Found {len(documents)} relevant documents for query: '{question}'")
            return documents
            
        except Exception as e:
            print(f"Error querying database: {str(e)}")
            return []
    
    def get_database_info(self) -> str:
        """Get information about the current database."""
        if self.db is None:
            return "Database not initialized"
        
        try:
            collection = self.db._collection
            count = collection.count()
            return f"Database contains {count} document chunks"
        except Exception as e:
            return f"Database information not available: {e}"
    
    def list_sources(self) -> Dict[str, int]:
        """List all sources in the database and their chunk counts."""
        if self.db is None:
            return {}
        
        try:
            # Get all documents with metadata
            all_docs = self.db.get()
            sources = {}
            
            for metadata in all_docs['metadatas']:
                source = metadata.get('source', 'Unknown')
                sources[source] = sources.get(source, 0) + 1
            
            return sources
            
        except Exception as e:
            print(f"Error listing sources: {str(e)}")
            return {}