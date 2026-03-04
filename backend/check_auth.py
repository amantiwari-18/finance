try:
    from auth import get_password_hash
    print("Import successful")
    print(get_password_hash("test"))
except Exception as e:
    print(f"Error: {e}")
