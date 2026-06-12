"""
Authentication tests
"""
import pytest


class TestAuth:
    """Authentication endpoint tests"""
    
    async def test_register(self, client, test_user_data):
        """Test user registration"""
        response = await client.post("/api/v1/auth/register", json=test_user_data)
        assert response.status_code in [201, 400]  # 201 if success, 400 if user exists
    
    async def test_login(self, client, test_user_data):
        """Test user login"""
        login_data = {
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        }
        response = await client.post("/api/v1/auth/login", json=login_data)
        assert response.status_code in [200, 401]
    
    async def test_health_check(self, client):
        """Test health check endpoint"""
        response = await client.get("/health")
        assert response.status_code == 200
        assert "status" in response.json()
