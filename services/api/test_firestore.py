#!/usr/bin/env python3
"""Simple test script to verify Firestore connectivity."""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

import firebase_admin
from firebase_admin import credentials, firestore

def test_firestore():
    print("→ Initializing Firebase...")
    try:
        if not firebase_admin._apps:
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
            firebase_admin.initialize_app(cred)
        
        db = firestore.client()
        print(f"✓ Connected to Firestore project: {os.getenv('FIREBASE_PROJECT_ID')}")
        
        print("→ Attempting to write a test document to 'test_collection'...")
        doc_ref = db.collection('test_collection').document('test_doc')
        doc_ref.set({'test': True, 'timestamp': firestore.SERVER_TIMESTAMP})
        
        print("✅ Firestore write successful!")
        
        print("→ Attempting to read back the document...")
        doc = doc_ref.get()
        if doc.exists:
            print(f"✅ Firestore read successful: {doc.to_dict()}")
        else:
            print("❌ Firestore read failed: Document does not exist")
            
        print("→ Cleaning up: deleting test document...")
        doc_ref.delete()
        print("✓ Test document deleted")
        
    except Exception as e:
        print(f"\n❌ ERROR: {type(e).__name__}: {e}")
        if "403" in str(e):
            print("\n💡 This usually means:")
            print("1. Firestore is not enabled in the Firebase Console (must be in Native mode).")
            print("2. The Service Account lacks 'Cloud Datastore User' or 'Firebase Firestore Admin' permissions.")
            print("3. The project ID in your .env might be incorrect.")

if __name__ == "__main__":
    test_firestore()
