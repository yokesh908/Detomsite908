"""
Main FastAPI application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
import logging

try:
    import sentry_sdk
except ImportError:
    sentry_sdk = None

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Sentry if DSN is provided
if sentry_sdk and settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        traces_sample_rate=1.0
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events"""
    # Startup
    logger.info("Starting DETOMSITE application")
    if settings.USE_LOCAL_DB:
        from app.core.local_demo_db import init_local_demo_db
        init_local_demo_db()
        logger.info("Local SQLite database initialized")
    else:
        from app.core.database import connect_to_mongo
        await connect_to_mongo()

        # Initialize default super admin if none exists
        from app.services.auth_service import init_default_super_admin
        await init_default_super_admin()

        from app.core.local_mongo_db import init_local_mongo_db
        await init_local_mongo_db()
        logger.info("MongoDB local API collections initialized")
    
    yield
    
    # Shutdown
    logger.info("Shutting down DETOMSITE application")
    if not settings.USE_LOCAL_DB:
        from app.core.database import close_mongo_connection
        await close_mongo_connection()


# Create FastAPI app instance
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Enterprise Campus Food Ordering Platform",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
from app.api.v1 import local
from app.middleware.error_handler import ErrorHandlingMiddleware, LoggingMiddleware

# Add middleware
app.add_middleware(ErrorHandlingMiddleware)
app.add_middleware(LoggingMiddleware)

app.include_router(
    local.router,
    prefix="/api/v1/local",
    tags=["Local Runnable API"]
)

if not settings.USE_LOCAL_DB:
    from app.api.v1 import auth, users, campuses, shops, products, orders, payments, reviews, tickets, admin, admin_super

    app.include_router(
        auth.router,
        prefix="/api/v1/auth",
        tags=["Authentication"]
    )
    app.include_router(
        users.router,
        prefix="/api/v1/users",
        tags=["Users"]
    )
    app.include_router(
        campuses.router,
        prefix="/api/v1/campuses",
        tags=["Campuses"]
    )
    app.include_router(
        shops.router,
        prefix="/api/v1/shops",
        tags=["Shops"]
    )
    app.include_router(
        products.router,
        prefix="/api/v1/products",
        tags=["Products"]
    )
    app.include_router(
        orders.router,
        prefix="/api/v1/orders",
        tags=["Orders"]
    )
    app.include_router(
        payments.router,
        prefix="/api/v1/payments",
        tags=["Payments"]
    )
    app.include_router(
        reviews.router,
        prefix="/api/v1/reviews",
        tags=["Reviews"]
    )
    app.include_router(
        tickets.router,
        prefix="/api/v1/tickets",
        tags=["Tickets"]
    )
    app.include_router(
        admin.router,
        prefix="/api/v1/admin",
        tags=["Admin"]
    )
    app.include_router(
        admin_super.router,
        prefix="/api/v1/super-admin",
        tags=["Super Admin"]
    )


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "redoc": "/redoc",
        "openapi": "/openapi.json"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)
