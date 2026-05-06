from supabase import create_client, Client
from .config import settings

# Single shared client using service role key (bypasses RLS for backend operations)
_client: Client | None = None


def get_supabase() -> Client:
    global _client
    if _client is None:
        _client = create_client(
            settings.supabase_url,
            settings.supabase_service_role_key,
        )
    return _client


# Convenience alias — import this everywhere instead of calling get_supabase()
supabase: Client = get_supabase()
