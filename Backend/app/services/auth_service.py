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
        """Hash a password (bcrypt has a 72-byte limit)"""
        # Bcrypt has a 72-byte limit, so truncate if necessary
        # Convert to bytes to check length
        password_bytes = password.encode('utf-8')
        original_length = len(password_bytes)
        
        if original_length > 72:
            # Truncate to 72 bytes, then ensure re-encoding is still <= 72 bytes
            # This handles cases where truncation breaks multi-byte UTF-8 characters
            truncated_bytes = password_bytes[:72]
            password = truncated_bytes.decode('utf-8', errors='ignore')
            
            # Verify the truncated password encodes to <= 72 bytes
            # If not, keep removing bytes until it does
            while len(password.encode('utf-8')) > 72:
                truncated_bytes = truncated_bytes[:-1]
                if len(truncated_bytes) == 0:
                    # Fallback: use ASCII-only truncation
                    password = password_bytes[:72].decode('ascii', errors='ignore')
                    break
                password = truncated_bytes.decode('utf-8', errors='ignore')
            
            logger.info(f"Password truncated from {original_length} to {len(password.encode('utf-8'))} bytes for bcrypt compatibility")
        
        # Hash the (possibly truncated) password
        # Double-check the length one more time before hashing
        final_bytes = password.encode('utf-8')
        if len(final_bytes) > 72:
            # Last resort: force truncation to 72 bytes
            password = final_bytes[:72].decode('utf-8', errors='ignore')
            logger.warning(f"Password forced to 72 bytes: {len(password.encode('utf-8'))} bytes")
        
        try:
            return pwd_context.hash(password)
        except ValueError as e:
            # If still too long (shouldn't happen), use bytes directly
            if "longer than 72 bytes" in str(e):
                logger.error(f"Password still too long after all truncation attempts. Original: {original_length} bytes")
                # Final fallback: use first 72 bytes as ASCII
                password = password_bytes[:72].decode('ascii', errors='ignore')
                return pwd_context.hash(password)
            raise
    
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
