import urllib.request
import urllib.parse
import urllib.error
import json

def test():
    # Login
    url = "http://localhost:8000/api/auth/login"
    params = urllib.parse.urlencode({"username": "test4@example.com", "password": "Password123!"}).encode()
    req = urllib.request.Request(url, data=params, headers={"Content-Type": "application/x-www-form-urlencoded"})
    token = None
    try:
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode())
            token = res["access_token"]
    except Exception as e:
        print("Login Error:", e)
        return

    if token:
        # Test GET /api/analytics/summary
        url = "http://localhost:8000/api/analytics/summary"
        req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
        try:
            with urllib.request.urlopen(req) as response:
                res = json.loads(response.read().decode())
                print(f"Summary: Income={res['total_income']}, Expense={res['total_expense']}, Balance={res['balance']}")
                print("\nCategory Breakdown:")
                for cat in res['category_breakdown']:
                    print(f"- {cat['category_name']}: Spent={cat['total_amount']}, Budget={cat.get('budget_amount', 'N/A')}")
        except urllib.error.HTTPError as e:
            print("Analytics Error:", e.code)
            print(e.read().decode())

if __name__ == "__main__":
    test()
