"""
Test configuration and fixtures
"""
import pytest
from httpx import AsyncClient
from app.main import app


@pytest.fixture
async def client():
    """Create test client"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


@pytest.fixture
async def test_user_data():
    """Test user data"""
    return {
        "email": "test@example.com",
        "password": "test_password_123",
        "first_name": "Test",
        "last_name": "User",
        "phone_number": "1234567890",
        "role": "customer"
    }
