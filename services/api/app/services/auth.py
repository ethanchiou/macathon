"""
Firebase Authentication Service
Initializes Firebase Admin SDK and provides token verification
"""
import os
from functools import lru_cache
from typing import Optional

import firebase_admin
from firebase_admin import auth, credentials, firestore
from fastapi import Depends, HTTPException, Header


@lru_cache()
def get_firebase_app():
    """Initialize Firebase Admin SDK with service account credentials."""
    if firebase_admin._apps:
        return firebase_admin.get_app()
    
    # Build credentials from environment variables
    cred_dict = {
        "type": "service_account",
        "project_id": os.getenv("FIREBASE_PROJECT_ID"),
        "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
        "private_key": os.getenv("FIREBASE_PRIVATE_KEY", "").replace("\\n", "\n"),
        "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
        "client_id": os.getenv("FIREBASE_CLIENT_ID"),
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/{os.getenv('FIREBASE_CLIENT_EMAIL', '').replace('@', '%40')}"
    }
    
    cred = credentials.Certificate(cred_dict)
    return firebase_admin.initialize_app(cred)


@lru_cache()
def get_firestore_client():
    """Get Firestore client instance."""
    get_firebase_app()
    return firestore.client()


async def verify_firebase_token(authorization: Optional[str] = Header(None)) -> str:
    """
    Dependency to verify Firebase ID token from Authorization header.
    Returns the user's UID if valid.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization format")
    
    token = authorization.split("Bearer ")[1]
    
    try:
        get_firebase_app()
        decoded_token = auth.verify_id_token(token)
        return decoded_token["uid"]
    except auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid ID token")
    except auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail="Expired ID token")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token verification failed: {str(e)}")


# Type alias for dependency injection
CurrentUser = str
