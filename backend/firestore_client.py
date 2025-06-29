import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore
import logging

# Set up basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

CREDENTIALS_PATH = os.getenv(
    "GOOGLE_APPLICATION_CREDENTIALS", "backend/serviceAccount.json")

if not os.path.exists(CREDENTIALS_PATH):
    logger.error(f"Service account file not found: {CREDENTIALS_PATH}")
    raise FileNotFoundError(
        f"Service account file not found: {CREDENTIALS_PATH}")

cred = credentials.Certificate(CREDENTIALS_PATH)

# Only initialize app if not already initialized (prevents duplicate errors in reloads)
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
    logger.info("Firebase app initialized.")
else:
    logger.info("Firebase app already initialized.")

db = firestore.client()
logger.info("Firestore client created.")
