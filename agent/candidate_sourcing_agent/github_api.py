"""GitHub API integration for candidate profile enrichment."""

import requests
import os
from typing import Optional, List, Dict, Any
from candidate_sourcing_agent.models import GitHubProfile, GitHubRepository


class GitHubAPI:
    """GitHub API client for fetching public user and repository data."""

    def __init__(self, github_token: Optional[str] = None):
        self.base_url = "https://api.github.com"
        self.session = requests.Session()

        # Use GitHub token if available for higher rate limits
        token = github_token or os.getenv("GITHUB_TOKEN")
        if token:
            self.session.headers.update({"Authorization": f"token {token}"})

        self.session.headers.update({
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "CandidateSourcingAgent/1.0"
        })

    def get_user_profile(self, username: str) -> Optional[GitHubProfile]:
        """Fetch GitHub user profile data."""
        try:
            # Get user data
            user_response = self.session.get(
                f"{self.base_url}/users/{username}")
            if user_response.status_code != 200:
                return None

            user_data = user_response.json()

            # Get user's repositories
            repos_response = self.session.get(
                f"{self.base_url}/users/{username}/repos",
                params={"sort": "stars", "per_page": 10}
            )

            repos_data = repos_response.json() if repos_response.status_code == 200 else []

            # Process repositories
            top_repositories = []
            languages = set()

            for repo in repos_data:
                if not repo.get("fork", False):  # Exclude forks
                    repo_obj = GitHubRepository(
                        name=repo["name"],
                        description=repo.get("description"),
                        language=repo.get("language"),
                        stars=repo.get("stargazers_count", 0),
                        forks=repo.get("forks_count", 0),
                        url=repo["html_url"]
                    )
                    top_repositories.append(repo_obj)

                    if repo.get("language"):
                        languages.add(repo["language"])

            # Get contribution stats (simplified)
            contribution_stats = {
                "total_repos": user_data.get("public_repos", 0),
                "account_created": user_data.get("created_at"),
                "last_updated": user_data.get("updated_at")
            }

            return GitHubProfile(
                username=username,
                profile_url=user_data["html_url"],
                bio=user_data.get("bio"),
                followers=user_data.get("followers", 0),
                following=user_data.get("following", 0),
                public_repos=user_data.get("public_repos", 0),
                top_repositories=top_repositories,
                primary_languages=list(languages),
                contribution_stats=contribution_stats
            )

        except Exception as e:
            print(f"Error fetching GitHub profile for {username}: {e}")
            return None

    def search_user_by_name(self, name: str) -> List[str]:
        """Search for GitHub users by name."""
        try:
            response = self.session.get(
                f"{self.base_url}/search/users",
                params={"q": name, "per_page": 5}
            )

            if response.status_code != 200:
                return []

            data = response.json()
            return [user["login"] for user in data.get("items", [])]

        except Exception as e:
            print(f"Error searching GitHub users: {e}")
            return []

    def check_rate_limit(self) -> Dict[str, Any]:
        """Check current rate limit status."""
        try:
            response = self.session.get(f"{self.base_url}/rate_limit")
            return response.json() if response.status_code == 200 else {}
        except Exception:
            return {}
