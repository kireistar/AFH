import sys
import os

# Add server directory to python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.asset import Asset

def migrate():
    db = SessionLocal()
    try:
        # Get all assets, ordered by ID to preserve original sequence
        assets = db.query(Asset).order_by(Asset.id).all()
        print(f"Found {len(assets)} assets to migrate.")
        
        category_prefixes = {
            "desktop": "001",
            "laptop": "002",
            "mobile": "003",
            "peripheral": "004",
            "projector": "005",
            "server": "006",
            "network": "007",
            "other": "008"
        }
        
        # Track sequence for each category
        sequences = {}
        
        for asset in assets:
            cat = asset.category.lower()
            prefix = category_prefixes.get(cat, "008")
            
            # Increment sequence
            sequences[cat] = sequences.get(cat, 0) + 1
            seq = sequences[cat]
            
            old_code = asset.asset_code
            new_code = f"{prefix}{seq:09d}"
            
            asset.asset_code = new_code
            print(f"Asset ID {asset.id} ({asset.asset_name}) [{asset.category}]: {old_code} -> {new_code}")
            
        db.commit()
        print("Migration committed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error during migration: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    migrate()
