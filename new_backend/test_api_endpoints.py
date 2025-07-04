#!/usr/bin/env python3

import requests
import json


def test_api_endpoints():
    """Test the API endpoints"""

    base_url = "http://localhost:8001"

    print("🧪 Testing API endpoints...")

    # Test health endpoint
    try:
        response = requests.get(f"{base_url}/health")
        print(f"✅ Health check: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"❌ Health check failed: {str(e)}")

    # Test jobs endpoint
    try:
        response = requests.get(f"{base_url}/jobs/active/list")
        print(f"✅ Jobs endpoint: {response.status_code}")
        if response.status_code == 200:
            jobs = response.json()
            print(f"   Found {len(jobs)} jobs")
            if jobs:
                print(f"   Sample job: {jobs[0]['title']}")
    except Exception as e:
        print(f"❌ Jobs endpoint failed: {str(e)}")

    # Test events endpoint
    try:
        response = requests.get(f"{base_url}/events/active/list")
        print(f"✅ Events endpoint: {response.status_code}")
        if response.status_code == 200:
            events = response.json()
            print(f"   Found {len(events)} events")
            if events:
                print(f"   Sample event: {events[0]['title']}")
    except Exception as e:
        print(f"❌ Events endpoint failed: {str(e)}")

    # Test creating an event
    try:
        event_data = {
            "title": "Test Event API",
            "description": "Test event description",
            "date": "2024-12-31",
            "location": "Test Location",
            "status": "active",
            "event_type": "test",
            "max_participants": 50
        }

        response = requests.post(f"{base_url}/events/", json=event_data)
        print(f"✅ Event creation: {response.status_code}")
        if response.status_code == 200:
            event = response.json()
            print(f"   Created event: {event.get('title', 'Unknown')}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"❌ Event creation failed: {str(e)}")


if __name__ == "__main__":
    test_api_endpoints()
