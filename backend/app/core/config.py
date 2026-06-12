"""
Backend application settings and configuration
"""
from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "DETOMSITE"
    APP_VERSION: str = "3.1.0"
    DEBUG: bool = False
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8001
    
    # Database
    USE_LOCAL_DB: bool = True
    USE_TURSO_DB: bool = False
    LOCAL_DB_PATH: str = "detomsite_local.db"
    TURSO_DATABASE_URL: str = ""
    TURSO_AUTH_TOKEN: str = ""
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "detomsite"
    SEED_DEMO_DATA: bool = False
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # JWT
    JWT_SECRET: Optional[str] = None
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Default Super Admin
    DEFAULT_SUPER_ADMIN_EMAIL: str = "12@gmail.com"
    DEFAULT_SUPER_ADMIN_PASSWORD: str = "8989"
    
    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""
    
    # Razorpay
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    
    # Sentry
    SENTRY_DSN: Optional[str] = None
    
    # CORS
    FRONTEND_URL: str = "http://localhost:5173"
    BACKEND_URL: str = "http://localhost:8001"
    ALLOWED_ORIGINS: list = ["http://localhost:5173", "http://localhost:3000"]

    @field_validator("DEBUG", mode="before")
    @classmethod
    def parse_debug(cls, value):
        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"release", "production", "prod", "false", "0", "no"}:
                return False
            if normalized in {"debug", "development", "dev", "true", "1", "yes"}:
                return True
        return value

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_allowed_origins(cls, value):
        if isinstance(value, str):
            normalized = value.strip()
            if normalized.startswith("["):
                return value
            return [origin.strip() for origin in normalized.split(",") if origin.strip()]
        return value

    @model_validator(mode="after")
    def validate_production_environment(self):
        if self.JWT_SECRET:
            self.SECRET_KEY = self.JWT_SECRET

        for origin in [self.FRONTEND_URL, self.BACKEND_URL]:
            if origin and origin not in self.ALLOWED_ORIGINS:
                self.ALLOWED_ORIGINS.append(origin)

        if self.USE_LOCAL_DB and not self.USE_TURSO_DB:
            return self

        missing = []
        if self.USE_TURSO_DB:
            if not self.TURSO_DATABASE_URL:
                missing.append("TURSO_DATABASE_URL")
            if not self.TURSO_AUTH_TOKEN:
                missing.append("TURSO_AUTH_TOKEN")
        elif not self.MONGODB_URL or self.MONGODB_URL == "mongodb://localhost:27017":
            missing.append("MONGODB_URL")
        if not self.DATABASE_NAME:
            missing.append("DATABASE_NAME")
        if not self.JWT_SECRET:
            missing.append("JWT_SECRET")
        if not self.FRONTEND_URL or "localhost" in self.FRONTEND_URL:
            missing.append("FRONTEND_URL")
        if not self.BACKEND_URL or "localhost" in self.BACKEND_URL:
            missing.append("BACKEND_URL")
        if self.SECRET_KEY in {"", "your-secret-key-change-in-production"}:
            missing.append("SECRET_KEY/JWT_SECRET")

        if missing:
            raise ValueError(
                "Production environment is missing required values: "
                + ", ".join(sorted(set(missing)))
            )

        return self
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
