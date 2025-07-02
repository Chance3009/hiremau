from supabase_client import supabase

# Get data from the table
response = (
    supabase.table("planets")
    .select("*")
    .execute()
)

# Insert data into the table
response = (
    supabase.table("planets")
    .insert({"id": 1, "name": "Pluto"})
    .execute()
)

# Update data in the table
response = (
    supabase.table("instruments")
    .update({"name": "piano"})
    .eq("id", 1)
    .execute()
)

# Upsert data into the table
response = (
    supabase.table("instruments")
    .upsert({"id": 1, "name": "piano"})
    .execute()
)

# Delete data from the table
response = (
    supabase.table("countries")
    .delete()
    .eq("id", 1)
    .execute()
)