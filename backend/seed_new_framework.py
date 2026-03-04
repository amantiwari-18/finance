from datetime import datetime
from database import SessionLocal
from models import User, Category, Subcategory, TransactionType

def seed_existing_users():
    db = SessionLocal()
    users = db.query(User).all()
    
    real_life_defaults = [
        ("Housing & Utilities", TransactionType.EXPENSE, "home", "#3b82f6", 
         ["Rent/Mortgage", "Electricity", "Water", "Internet", "Trash"]),
        
        ("Food & Dining", TransactionType.EXPENSE, "utensils", "#ef4444", 
         ["Groceries", "Restaurants", "Coffee Shops", "Fast Food", "Alcohol"]),
        
        ("Transportation", TransactionType.EXPENSE, "car", "#6366f1", 
         ["Fuel", "Public Transit", "Parking", "Maintenance", "Insurance"]),
        
        ("Shopping & Lifestyle", TransactionType.EXPENSE, "shopping-bag", "#ec4899", 
         ["Clothing", "Electronics", "Home Decor", "Beauty", "Pets"]),
        
        ("Health & Fitness", TransactionType.EXPENSE, "heart", "#10b981", 
         ["Gym", "Pharmacy", "Doctor", "Dental"]),
        
        ("Entertainment", TransactionType.EXPENSE, "film", "#f59e0b", 
         ["Subscriptions", "Movies", "Outings", "Hobbies"]),
        
        ("Loans & Obligations", TransactionType.EXPENSE, "landmark", "#465A65", 
         ["Student Loan", "Personal Loan", "Credit Card"]),
        
        ("Income", TransactionType.INCOME, "banknote", "#2E9CA0", 
         ["Salary", "Freelance", "Investment Returns", "Gifts/Refunds"]),
    ]
    
    try:
        for user in users:
            print(f"Seeding user: {user.email}")
            # Check if user already has categories (should be 0 after wipe)
            existing_cats = db.query(Category).filter(Category.user_id == user.id).count()
            if existing_cats > 0:
                print(f"Skipping {user.email}, already has categories.")
                continue
                
            for cat_name, cat_type, icon, color, subcats in real_life_defaults:
                new_cat = Category(
                    name=cat_name,
                    type=cat_type,
                    icon=icon,
                    color=color,
                    user_id=user.id,
                    created_at=datetime.utcnow()
                )
                db.add(new_cat)
                db.flush()
                
                for sub_name in subcats:
                    new_sub = Subcategory(
                        name=sub_name,
                        category_id=new_cat.id,
                        user_id=user.id,
                        created_at=datetime.utcnow()
                    )
                    db.add(new_sub)
        
        db.commit()
        print("Seeding complete.")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_existing_users()
