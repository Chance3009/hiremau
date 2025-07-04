#!/usr/bin/env python3
"""
Test script to validate the HireMau Agent setup and functionality.
"""

import os
import sys
import json
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv()


def test_environment_variables():
    """Test if all required environment variables are set."""
    print("🧪 Testing environment variables...")

    required_vars = ["GOOGLE_API_KEY",
                     "SUPABASE_URL", "SUPABASE_KEY", "API_TOKEN"]
    missing_vars = []

    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)

    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        return False
    else:
        print("✅ All required environment variables are set")
        return True


def test_agent_endpoint():
    """Test if the agent endpoint is working."""
    print("\n🧪 Testing agent endpoint...")

    try:
        # Test health endpoint
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Agent health endpoint is working")
            return True
        else:
            print(
                f"❌ Agent health endpoint returned status: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Agent is not running on port 8000")
        return False
    except Exception as e:
        print(f"❌ Error testing agent endpoint: {e}")
        return False


def test_agent_document_processing():
    """Test document processing with a simple test."""
    print("\n🧪 Testing document processing...")

    try:
        # Prepare test data
        test_data = {
            "name": "Test Candidate",
            "url": "https://opkfbbymirprtpmfangg.supabase.co/storage/v1/object/public/resume/7c7ae0c4-5717-4406-b76d-1aa741993b40_Resume.pdf?",
            "uuid": "0486b464-9630-4698-ba20-fee29c530840"
        }

        # Send request to agent
        response = requests.post(
            "http://localhost:8000/add-doc",
            json=test_data,
            timeout=30
        )

        if response.status_code == 200:
            print("✅ Agent processed test request successfully")
            return True
        else:
            print(f"❌ Agent returned status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False

    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to agent - make sure it's running")
        return False
    except Exception as e:
        print(f"❌ Error testing document processing: {e}")
        return False


def main():
    """Run all tests."""
    print("🔍 Testing HireMau Agent Setup...")
    print("=" * 50)

    # Test environment variables
    env_ok = test_environment_variables()

    if not env_ok:
        print("\n❌ Environment variables test failed")
        print(
            "Please make sure all required environment variables are set in your .env file")
        return False

    # Test agent endpoint
    endpoint_ok = test_agent_endpoint()

    if not endpoint_ok:
        print("\n❌ Agent endpoint test failed")
        print("Please start the agent by running: python agent.py")
        return False

    # Test document processing
    processing_ok = test_agent_document_processing()

    if processing_ok:
        print("\n🎉 All tests passed! Your HireMau Agent is working correctly.")
        return True
    else:
        print("\n❌ Document processing test failed")
        print("Check the agent logs for more details")
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
