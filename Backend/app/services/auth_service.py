"""
Authentication Service for INSPIRE Project
Handles SME signup, login, and JWT token management
"""

import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from passlib.context import CryptContext
from fastapi import HTTPException, status
import logging

from app.config import settings
from app.models import SMESignupBasic, SMESignupComplete, SMEUpdate, SMELogin, TokenData
from app.database_mysql_inspire import inspire_db

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = getattr(settings, 'jwt_secret', 'your-secret-key-here')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

class AuthService:
    """Authentication service for SME users"""
    
    def __init__(self):
        self.db = inspire_db
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password: str) -> str:
        """Hash a password"""
        return pwd_context.hash(password)
    
    def create_access_token(self, data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    def verify_token(self, token: str) -> Optional[TokenData]:
        """Verify and decode a JWT token"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            sme_id: int = payload.get("sub")
            email: str = payload.get("email")
            
            if sme_id is None or email is None:
                return None
            
            return TokenData(sme_id=sme_id, email=email)
        except jwt.PyJWTError:
            return None
    
    async def signup_sme_basic(self, sme_data: SMESignupBasic) -> Dict[str, Any]:
        """Register a new SME with basic information only"""
        try:
            # Check if email already exists
            existing_sme = await self.db.get_sme_by_email(sme_data.contact_email)
            if existing_sme:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
            
            # Hash the password
            password_hash = self.get_password_hash(sme_data.password)
            
            # Create SME in database with basic info only
            sme_id = await self.db.create_sme_with_password(
                name=sme_data.name,
                sector="",  # Empty sector initially
                objective="",  # Empty objective initially
                contact_email=sme_data.contact_email,
                password_hash=password_hash
            )
            
            # Get the created SME
            sme = await self.db.get_sme(sme_id)
            
            # Create access token
            access_token = self.create_access_token(
                data={"sub": sme_id, "email": sme_data.contact_email}
            )
            
            logger.info(f"New SME registered (basic): {sme_data.contact_email} (ID: {sme_id})")
            
            return {
                "sme": sme,
                "access_token": access_token,
                "token_type": "bearer"
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error during SME basic signup: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Registration failed"
            )
    
    async def update_sme_profile(self, sme_id: int, update_data: SMEUpdate) -> Dict[str, Any]:
        """Update SME profile with sector and objective"""
        try:
            # Update SME in database
            success = await self.db.update_sme(
                sme_id=sme_id,
                sector=update_data.sector,
                objective=update_data.objective
            )
            
            if not success:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to update SME profile"
                )
            
            # Get updated SME
            sme = await self.db.get_sme(sme_id)
            
            logger.info(f"SME profile updated: {sme_id}")
            
            return {
                "sme": sme,
                "message": "Profile updated successfully"
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating SME profile: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Profile update failed"
            )
    
    async def signup_sme(self, sme_data: SMESignupComplete) -> Dict[str, Any]:
        """Register a new SME user"""
        try:
            # Check if email already exists
            existing_sme = await self.db.get_sme_by_email(sme_data.contact_email)
            if existing_sme:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
            
            # Hash the password
            password_hash = self.get_password_hash(sme_data.password)
            
            # Create SME in database
            sme_id = await self.db.create_sme_with_password(
                name=sme_data.name,
                sector=sme_data.sector,
                objective=sme_data.objective,
                contact_email=sme_data.contact_email,
                password_hash=password_hash
            )
            
            # Get the created SME
            sme = await self.db.get_sme(sme_id)
            
            # Create access token
            access_token = self.create_access_token(
                data={"sub": sme_id, "email": sme_data.contact_email}
            )
            
            logger.info(f"New SME registered: {sme_data.contact_email} (ID: {sme_id})")
            
            return {
                "sme": sme,
                "access_token": access_token,
                "token_type": "bearer"
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error during SME signup: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Registration failed"
            )
    
    async def login_sme(self, login_data: SMELogin) -> Dict[str, Any]:
        """Authenticate an SME user"""
        try:
            # Get SME by email
            sme = await self.db.get_sme_by_email(login_data.contact_email)
            if not sme:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password"
                )
            
            # Verify password
            if not self.verify_password(login_data.password, sme['password_hash']):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password"
                )
            
            # Create access token
            access_token = self.create_access_token(
                data={"sub": sme['sme_id'], "email": login_data.contact_email}
            )
            
            logger.info(f"SME logged in: {login_data.contact_email} (ID: {sme['sme_id']})")
            
            return {
                "sme": sme,
                "access_token": access_token,
                "token_type": "bearer"
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error during SME login: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Login failed"
            )
    
    async def get_current_sme(self, token: str) -> Optional[Dict[str, Any]]:
        """Get current SME from token"""
        try:
            token_data = self.verify_token(token)
            if token_data is None:
                return None
            
            sme = await self.db.get_sme(token_data.sme_id)
            return sme
            
        except Exception as e:
            logger.error(f"Error getting current SME: {str(e)}")
            return None

# Global auth service instance
auth_service = AuthService()
