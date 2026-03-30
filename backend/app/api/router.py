from fastapi import APIRouter

from app.api.routes import applications, auth, documents, employers, interviews, reminders, stats

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(employers.router, prefix="/employers", tags=["employers"])
api_router.include_router(applications.router, prefix="/applications", tags=["applications"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(interviews.router, prefix="/interviews", tags=["interviews"])
api_router.include_router(reminders.router, prefix="/reminders", tags=["reminders"])
api_router.include_router(stats.router, prefix="/stats", tags=["stats"])
