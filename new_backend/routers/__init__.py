# Routers package

from .jobs_router import router as jobs_router
from .events_router import router as events_router
from .candidates_router import router as candidates_router
from .interviews_router import router as interviews_router
from .ai_router import router as ai_router

# Export routers directly
__all__ = ['jobs_router', 'events_router',
           'candidates_router', 'interviews_router', 'ai_router']
