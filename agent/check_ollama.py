#!/usr/bin/env python3
"""
Check if Ollama is running and if the required model is available.
"""

import requests
import subprocess
import os
from langchain_ollama import OllamaEmbeddings


def check_ollama_service():
    """Check if Ollama service is running."""
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if response.status_code == 200:
            print("✅ Ollama service is running")
            return True
        else:
            print(
                f"❌ Ollama service returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Ollama service is not running")
        return False
    except requests.exceptions.Timeout:
        print("❌ Ollama service is not responding (timeout)")
        return False
    except Exception as e:
        print(f"❌ Error checking Ollama service: {e}")
        return False


def check_model_availability():
    """Check if the required model is available."""
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if response.status_code == 200:
            models = response.json()
            model_names = [model['name'] for model in models.get('models', [])]

            required_model = "nomic-embed-text"
            if any(required_model in name for name in model_names):
                print(f"✅ Model '{required_model}' is available")
                return True
            else:
                print(f"❌ Model '{required_model}' is not available")
                print(f"Available models: {model_names}")
                return False
        else:
            print(f"❌ Failed to get model list: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error checking model availability: {e}")
        return False


def test_embeddings():
    """Test if embeddings work correctly."""
    try:
        embedding = OllamaEmbeddings(model="nomic-embed-text")
        test_text = "This is a test sentence."
        result = embedding.embed_query(test_text)

        if result and len(result) > 0:
            print(f"✅ Embeddings working correctly (dimension: {len(result)})")
            return True
        else:
            print("❌ Embeddings returned empty result")
            return False
    except Exception as e:
        print(f"❌ Error testing embeddings: {e}")
        return False


def main():
    print("🔍 Checking Ollama setup for HireMau Agent...")
    print("=" * 50)

    # Check if Ollama is running
    ollama_running = check_ollama_service()

    if not ollama_running:
        print("\n💡 To fix this:")
        print("1. Install Ollama from https://ollama.com/")
        print("2. Start Ollama service:")
        print("   - Windows: Run 'ollama serve' in PowerShell")
        print("   - macOS/Linux: Run 'ollama serve' in terminal")
        return

    # Check if model is available
    model_available = check_model_availability()

    if not model_available:
        print("\n💡 To fix this:")
        print("Run the following command to download the required model:")
        print("ollama pull nomic-embed-text")
        return

    # Test embeddings
    embeddings_working = test_embeddings()

    if embeddings_working:
        print("\n🎉 All checks passed! Ollama is ready for the HireMau Agent.")
    else:
        print("\n❌ Embeddings test failed. Please check your Ollama setup.")


if __name__ == "__main__":
    main()
