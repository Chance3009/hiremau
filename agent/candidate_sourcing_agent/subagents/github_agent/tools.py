"""
GitHub Information Tool

This module provides a tool for gathering GitHub profile and repository information.
"""

import time
import re
from typing import Any, Dict, Optional
from candidate_sourcing_agent.github_api import GitHubAPI


def get_github_info(github_url: str) -> Dict[str, Any]:
    """
    Gather GitHub profile information from a GitHub profile URL.

    Args:
        github_url: GitHub profile URL (e.g., https://github.com/username)

    Returns:
        Dict[str, Any]: Dictionary with GitHub information structured for ADK
    """
    try:
        # Extract username from GitHub URL
        username = extract_github_username(github_url)

        if not username:
            return {
                "result": {"error": f"Could not extract username from GitHub URL: {github_url}"},
                "stats": {"success": False},
                "additional_info": {"error_type": "InvalidURL"}
            }

        github_api = GitHubAPI()
        profile = github_api.get_user_profile(username)

        if not profile:
            return {
                "result": {"error": f"GitHub profile not found for username: {username}"},
                "stats": {"success": False},
                "additional_info": {"error_type": "ProfileNotFound"}
            }

        # Convert Pydantic model to dict for ADK
        profile_data = profile.model_dump()

        # Calculate some stats for analysis
        repo_count = profile_data.get("public_repos", 0)
        follower_count = profile_data.get("followers", 0)
        languages = profile_data.get("primary_languages", [])

        # Assess technical activity level
        high_activity = repo_count > 10 and follower_count > 50

        return {
            "result": profile_data,
            "stats": {
                "username": username,
                "github_url": github_url,
                "public_repos": repo_count,
                "followers": follower_count,
                "primary_languages_count": len(languages),
                "high_activity_profile": high_activity,
            },
            "additional_info": {
                "data_format": "github_profile",
                "collection_timestamp": time.time(),
                "technical_assessment": (
                    "High technical activity detected" if high_activity
                    else "Moderate technical presence"
                ),
                "top_languages": languages[:3],  # Top 3 languages
            },
        }

    except Exception as e:
        return {
            "result": {"error": f"Failed to gather GitHub information: {str(e)}"},
            "stats": {"success": False},
            "additional_info": {"error_type": str(type(e).__name__)},
        }


def extract_github_username(github_url: str) -> Optional[str]:
    """
    Extract username from various GitHub URL formats.

    Supported formats:
    - https://github.com/username
    - https://github.com/username/
    - http://github.com/username
    - github.com/username
    - username (if it's just a plain username)

    Args:
        github_url: GitHub URL or username

    Returns:
        Optional[str]: Extracted username or None if invalid
    """
    if not github_url:
        return None

    # Remove leading/trailing whitespace
    url = github_url.strip()

    # If it's just a username without URL parts, return it
    if '/' not in url and '.' not in url:
        return url if url else None

    # Handle various GitHub URL formats
    patterns = [
        # Standard GitHub URLs
        r'(?:https?://)?(?:www\.)?github\.com/([^/]+)/?$',
        r'(?:https?://)?github\.com/([^/]+)/?$',           # Without www
        r'^([^/]+)$'                                       # Just username
    ]

    for pattern in patterns:
        match = re.match(pattern, url)
        if match:
            username = match.group(1)
            # Validate username (GitHub usernames can contain alphanumeric, hyphens, no spaces)
            if re.match(r'^[a-zA-Z0-9\-]+$', username):
                return username

    return None
