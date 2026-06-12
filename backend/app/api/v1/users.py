"""
Users API routes
"""
from fastapi import APIRouter, HTTPException, Depends, status
from app.schemas import UserResponse
from app.api.v1.auth import get_current_user
from app.models import User
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get user profile"""
    return current_user


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    first_name: str = None,
    last_name: str = None,
    phone_number: str = None,
    current_user: User = Depends(get_current_user)
):
    """Update user profile"""
    if first_name:
        current_user.first_name = first_name
    if last_name:
        current_user.last_name = last_name
    if phone_number:
        current_user.phone_number = phone_number
    
    await current_user.save()
    return current_user
