import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timezone
from typing import Optional
import logging
from config import FIREBASE_CREDENTIALS_PATH, CACHE_EXPIRY_DAYS
from utils.helpers import FirebaseConnectionError

logger = logging.getLogger(__name__)

db = None

def get_db():
    global db
    if db is not None:
        return db
        
    try:
        cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        logger.info("Firebase Admin SDK initialized successfully.")
        return db
    except Exception as e:
        logger.error(f"Failed to initialize Firebase: {str(e)}")
        raise FirebaseConnectionError("Could not connect to Firebase. Check credentials path.")

import json
import os

def get_plans(collection_name: str) -> list:
    """Reads all meal plans from the local JSON files instead of Firestore."""
    try:
        if collection_name in ["veg", "vegetarian"]:
            file_name = "veg_plans.json"
        elif collection_name == "vegan":
            file_name = "vegan_plans.json"
        else:
            file_name = f"{collection_name}.json"
            
        base_dir = os.path.dirname(__file__)
        file_path = os.path.join(base_dir, "data", file_name)
        
        with open(file_path, "r", encoding="utf-8") as f:
            plans = json.load(f)
            
        for i, p in enumerate(plans):
            if "planId" not in p and "plan_id" not in p:
                p["planId"] = f"{collection_name}_{i}"
                
        return plans
    except Exception as e:
        logger.error(f"Error reading local file {collection_name}.json: {str(e)}")
        return []

CACHE_FILE = os.path.join(os.path.dirname(__file__), "data", "macro_cache.json")

def _load_cache() -> dict:
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except:
            return {}
    return {}

def _save_cache(data: dict):
    try:
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        logger.warning(f"Failed to write local cache: {str(e)}")

def cache_nutrition(ingredient_name: str, nutrition_data: dict):
    """Saves API results to the local macro_cache.json."""
    try:
        doc_id = ingredient_name.lower().strip().replace(' ', '_').replace('/', '_')
        cache = _load_cache()
        cache[doc_id] = {
            **nutrition_data,
            'cached_at_ts': datetime.now(timezone.utc).timestamp()
        }
        _save_cache(cache)
    except Exception as e:
        logger.warning(f"Failed to cache nutrition for {ingredient_name}: {str(e)}")

def get_cached_nutrition(ingredient_name: str) -> Optional[dict]:
    """Returns cached nutrition dict if exists and not older than CACHE_EXPIRY_DAYS."""
    try:
        doc_id = ingredient_name.lower().strip().replace(' ', '_').replace('/', '_')
        cache = _load_cache()
        
        if doc_id in cache:
            data = cache[doc_id]
            cached_at_ts = data.get('cached_at_ts')
            if cached_at_ts:
                cached_at = datetime.fromtimestamp(cached_at_ts, tz=timezone.utc)
                delta = datetime.now(timezone.utc) - cached_at
                if delta.days <= CACHE_EXPIRY_DAYS:
                    logger.debug(f"Cache HIT for {ingredient_name}")
                    return data
            logger.debug(f"Cache EXPIRED for {ingredient_name}")
            
    except Exception as e:
        logger.warning(f"Error reading cache for {ingredient_name}: {str(e)}")
        
    return None

def log_recommendation(user_input: dict, recommended_plans: list):
    """Saves a log document to a local JSONL file for future analytics."""
    try:
        log_data = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "user_request": user_input,
            "recommendations": recommended_plans
        }
        
        base_dir = os.path.dirname(__file__)
        log_file = os.path.join(base_dir, "data", "recommendation_logs.jsonl")
        
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(log_data) + "\n")
            
    except Exception as e:
        logger.warning(f"Failed to log recommendation locally: {str(e)}")
