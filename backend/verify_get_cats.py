import urllib.request
import urllib.parse
import urllib.error
import json

def test():
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

    if token:
        # Test GET /api/categories
        url = "http://localhost:8000/api/categories"
        req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
        try:
            with urllib.request.urlopen(req) as response:
                print("Get Categories Status:", response.getcode())
                res = json.loads(response.read().decode())
                print(f"Found {len(res)} categories")
        except urllib.error.HTTPError as e:
            print("Get Categories Error:", e.code)
            print(e.read().decode())

if __name__ == "__main__":
    test()
