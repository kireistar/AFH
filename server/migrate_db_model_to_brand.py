import sys
import os

# Add server directory to python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine
from sqlalchemy import text

def run_migration():
    with engine.connect() as connection:
        trans = connection.begin()
        try:
            # 1. Rename column 'model' to 'brand' if it exists
            res = connection.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_schema = 'public' AND table_name = 'assets' AND column_name = 'model';
            """)).fetchone()
            
            if res:
                print("Renaming column 'model' to 'brand' in table 'assets'...")
                connection.execute(text("ALTER TABLE public.assets RENAME COLUMN model TO brand;"))
                print("Column renamed successfully.")
            else:
                print("Column 'model' not found or already renamed.")

            # 2. Update existing rows to map the values in the new 'brand' column
            assets = connection.execute(text("SELECT id, asset_name, brand FROM public.assets;")).fetchall()
            print(f"Migrating brand values for {len(assets)} assets:")
            for row in assets:
                asset_id = row[0]
                name = row[1] or ""
                brand = row[2] or ""
                
                new_brand = None
                
                # Check current brand or name for keyword mapping
                search_str = (brand + " " + name).lower()
                if "macbook" in search_str or "ipad" in search_str or "apple" in search_str:
                    new_brand = "Apple"
                elif "thinkpad" in search_str or "lenovo" in search_str:
                    new_brand = "Lenovo"
                elif "logitech" in search_str:
                    new_brand = "Logitech"
                elif "epson" in search_str:
                    new_brand = "Epson"
                elif "dell" in search_str or "poweredge" in search_str:
                    new_brand = "Dell"
                
                if new_brand:
                    print(f"  Asset ID {asset_id} ('{name}', brand: '{brand}') -> '{new_brand}'")
                    connection.execute(
                        text("UPDATE public.assets SET brand = :new_brand WHERE id = :asset_id;"),
                        {"new_brand": new_brand, "asset_id": asset_id}
                    )
            
            trans.commit()
            print("Database migration completed successfully!")
        except Exception as e:
            trans.rollback()
            print(f"Error during database migration: {e}")
            raise e

if __name__ == "__main__":
    run_migration()
