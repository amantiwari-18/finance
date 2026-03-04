import urllib.request
import urllib.parse
import urllib.error
import json
from datetime import datetime

def seed():
    # Login to get token
    url = "http://localhost:8000/api/auth/login"
    params = urllib.parse.urlencode({"username": "test4@example.com", "password": "Password123!"}).encode()
    req = urllib.request.Request(url, data=params, headers={"Content-Type": "application/x-www-form-urlencoded"})
    token = None
    try:
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode())
            token = res["access_token"]
            print("Login Status:", response.getcode())
    except urllib.error.HTTPError as e:
        print("Login Error:", e.code)
        print(e.read().decode())
        return

    if not token: return

    # Helper for POST
    def post(path, data):
        req = urllib.request.Request(f"http://localhost:8000{path}", 
                                     data=json.dumps(data).encode(), 
                                     headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"})
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())

    try:
        # 1. Create Groceries Category
        groceries_cat = post("/api/categories", {"name": "Groceries", "type": "expense", "icon": "shopping-cart", "color": "#f59e0b"})
        print("Created Groceries Category")

        # 2. Create Milk Subcategory
        milk_sub = post("/api/subcategories", {"name": "Milk", "category_id": groceries_cat["id"]})
        print("Created Milk Subcategory")

        # 3. Create Salary Category
        salary_cat = post("/api/categories", {"name": "Salary", "type": "income", "icon": "banknote", "color": "#10b981"})
        print("Created Salary Category")

        # 4. Transaction: Milk
        post("/api/transactions", {
            "category_id": groceries_cat["id"],
            "subcategory_id": milk_sub["id"],
            "amount": 500.0,
            "date": datetime.utcnow().isoformat(),
            "description": "Weekly milk supply"
        })
        print("Created Milk Transaction (500 INR)")

        # 5. Transaction: Salary
        # Need a subcategory for salary too? 
        # Check if subcategory is optional in schema?
        # schema.py says: subcategory_id: int (Required)
        # So I need to create a subcategory for Salary too.
        salary_sub = post("/api/subcategories", {"name": "Main Salary", "category_id": salary_cat["id"]})
        
        post("/api/transactions", {
            "category_id": salary_cat["id"],
            "subcategory_id": salary_sub["id"],
            "amount": 50000.0,
            "date": datetime.utcnow().isoformat(),
            "description": "Monthly Salary"
        })
        print("Created Salary Transaction (50,000 INR)")

        # 6. Create Budget
        post("/api/budgets", {
            "category_id": groceries_cat["id"],
            "amount": 2000.0,
            "period": "monthly"
        })
        print("Created Groceries Budget (2,000 INR)")

    except Exception as e:
        print("Seed Error:", str(e))

if __name__ == "__main__":
    seed()
