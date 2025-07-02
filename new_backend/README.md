# 🚀 new_backend: Supabase Integration Example

## Overview

This directory demonstrates how to set up and use Supabase as a backend service in Python, following best practices for environment management, client initialization, and modular usage.

## 🏗️ Structure

```
new_backend/
├── requirements.txt         # Python dependencies
├── supabase_client.py       # Supabase client setup (import this in your code)
├── supabase_example.py      # Example usage of Supabase client and queries
├── .env.example             # Example format of the environment file
```

## 🚦 Quick Start

### Prerequisites

- Python 3.8+
- A Supabase project (get your URL and API key from the Supabase dashboard)

### Installation

```bash
# Navigate to the new_backend directory
cd new_backend

# (Optional) Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Environment Setup

Create a `.env` file in `new_backend/` with the following content:

```
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-api-key
```

Or duplicate .env.example and rename it to .env

Replace `your-supabase-url` and `your-supabase-api-key` with your actual Supabase project credentials.

### Usage

#### 1. Import the Supabase Client

Use the provided `supabase_client.py` to get a ready-to-use Supabase client:

```python
from supabase_client import supabase

# Example: Fetch all rows from the 'planets' table
response = supabase.table("planets").select("*").execute()
print(response.data)
```

#### 2. Example Operations

See `supabase_example.py` for more detailed usage, including:

- Selecting data from a table
- Inserting new rows
- Updating existing rows
- Upserting (insert or update) data
- Deleting rows

Example snippet:
```python
# Insert a new planet
response = supabase.table("planets").insert({"id": 1, "name": "Pluto"}).execute()
print(response.data)
```

### Error Handling

If the required environment variables are not set, the client will raise a clear error and log the issue.

### Extending

You can now import and use the `supabase` client in any other module within `new_backend` for your own business logic. 