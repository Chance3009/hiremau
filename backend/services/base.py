from typing import Optional
from supabase_client import get_supabase


class BaseService:
    _instance: Optional['BaseService'] = None

    def __init__(self):
        self.supabase = get_supabase()

    @classmethod
    def get_instance(cls) -> 'BaseService':
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance
