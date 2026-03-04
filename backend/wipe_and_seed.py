from sqlalchemy import text
from database import engine

def wipe_data():
    with engine.connect() as connection:
        transaction = connection.begin()
        try:
            print("Wiping all dynamic data...")
            # We must delete in order to satisfy foreign key constraints
            connection.execute(text("DELETE FROM transactions"))
            connection.execute(text("DELETE FROM recurring_transactions"))
            connection.execute(text("DELETE FROM budgets"))
            connection.execute(text("DELETE FROM loans"))
            connection.execute(text("DELETE FROM subcategories"))
            connection.execute(text("DELETE FROM categories"))
            # Optionally delete users? The user said "remove the data in there... all transactions and category"
            # If I delete users, they can't login. I'll keep users but clear their data.
            print("Wipe complete.")
            transaction.commit()
        except Exception as e:
            transaction.rollback()
            print(f"Error during wipe: {e}")

if __name__ == "__main__":
    wipe_data()
