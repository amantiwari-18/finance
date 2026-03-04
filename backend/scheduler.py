from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import SessionLocal
from email_service import send_daily_summary_email, send_budget_alert_email
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()

def get_db_session():
    """Get database session for scheduler tasks"""
    return SessionLocal()

async def daily_summary_task():
    """Send daily summary emails to all users"""
    logger.info("Running daily summary task")
    db = get_db_session()
    try:
        # Get all users
        users = db.execute(text("SELECT id, email FROM users")).fetchall()
        today = datetime.now().date()
        month_start = today.replace(day=1)
        
        for user in users:
            # Get today's transactions with category info
            result_today = db.execute(
                text("""
                    SELECT t.amount, c.type
                    FROM transactions t
                    JOIN categories c ON t.category_id = c.id
                    WHERE t.user_id = :user_id AND DATE(t.date) = :today
                """),
                {"user_id": user.id, "today": today}
            ).fetchall()
            
            # ONLY send if today any transactions were made
            if len(result_today) == 0:
                continue

            total_income_today = sum(row.amount for row in result_today if row.type == 'income')
            total_expense_today = sum(row.amount for row in result_today if row.type == 'expense')
            
            # Get month's transactions
            result_month = db.execute(
                text("""
                    SELECT t.amount, c.type
                    FROM transactions t
                    JOIN categories c ON t.category_id = c.id
                    WHERE t.user_id = :user_id AND DATE(t.date) >= :month_start AND DATE(t.date) <= :today
                """),
                {"user_id": user.id, "month_start": month_start, "today": today}
            ).fetchall()

            total_income_month = sum(row.amount for row in result_month if row.type == 'income')
            total_expense_month = sum(row.amount for row in result_month if row.type == 'expense')

            await send_daily_summary_email(
                user.email,
                total_expense_today,
                total_income_today,
                len(result_today),
                total_expense_month,
                total_income_month,
                len(result_month)
            )
    except Exception as e:
        logger.error(f"Error in daily summary task: {str(e)}")
    finally:
        db.close()

async def budget_check_task():
    """Check budgets and send alerts"""
    logger.info("Running budget check task")
    db = get_db_session()
    try:
        # Get all budgets
        budgets = db.execute(
            text("""
                SELECT id, user_id, category_id, subcategory_id, amount, period
                FROM budgets
            """)
        ).fetchall()
        
        for budget in budgets:
            # Calculate date range based on period
            now = datetime.now()
            if budget.period == "daily":
                start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
            elif budget.period == "weekly":
                start_date = now - timedelta(days=now.weekday())
            elif budget.period == "monthly":
                start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            else:  # yearly
                start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
            
            # Get spending for this budget
            query = """
                SELECT COALESCE(SUM(amount), 0) as spent
                FROM transactions
                WHERE user_id = :user_id
                AND category_id = :category_id
                AND date >= :start_date
            """
            params = {
                "user_id": budget.user_id,
                "category_id": budget.category_id,
                "start_date": start_date
            }
            
            if budget.subcategory_id:
                query += " AND subcategory_id = :subcategory_id"
                params["subcategory_id"] = budget.subcategory_id
            
            spent_result = db.execute(text(query), params).first()
            spent = float(spent_result.spent or 0)
            percentage = (spent / budget.amount) * 100 if budget.amount > 0 else 0
            
            # Send alert if over 80% or exceeded
            if percentage >= 80:
                # Get user email
                user = db.execute(
                    text("SELECT email FROM users WHERE id = :id"),
                    {"id": budget.user_id}
                ).first()
                
                # Get category name
                category = db.execute(
                    text("SELECT name FROM categories WHERE id = :id"),
                    {"id": budget.category_id}
                ).first()
                
                category_name = category.name if category else "Unknown"
                
                await send_budget_alert_email(
                    user.email,
                    category_name,
                    spent,
                    budget.amount,
                    percentage
                )
    except Exception as e:
        logger.error(f"Error in budget check task: {str(e)}")
    finally:
        db.close()

async def recurring_transaction_task():
    """Create transactions from recurring transactions that are due"""
    logger.info("Running recurring transaction task")
    db = get_db_session()
    try:
        now = datetime.now()
        
        # Get due recurring transactions
        due_recurring = db.execute(
            text("""
                SELECT id, user_id, category_id, subcategory_id, amount, description, frequency, next_due_date
                FROM recurring_transactions
                WHERE next_due_date <= :now
            """),
            {"now": now}
        ).fetchall()
        
        for recurring in due_recurring:
            # Create new transaction
            db.execute(
                text("""
                    INSERT INTO transactions (user_id, category_id, subcategory_id, amount, date, description, created_at)
                    VALUES (:user_id, :category_id, :subcategory_id, :amount, :date, :description, :created_at)
                """),
                {
                    "user_id": recurring.user_id,
                    "category_id": recurring.category_id,
                    "subcategory_id": recurring.subcategory_id,
                    "amount": recurring.amount,
                    "date": now,
                    "description": recurring.description,
                    "created_at": now
                }
            )
            
            # Calculate next due date
            next_due = recurring.next_due_date
            if recurring.frequency == 'daily':
                next_due += timedelta(days=1)
            elif recurring.frequency == 'weekly':
                next_due += timedelta(weeks=1)
            elif recurring.frequency == 'monthly':
                next_due += timedelta(days=30)
            elif recurring.frequency == 'yearly':
                next_due += timedelta(days=365)
            
            # Update next due date
            db.execute(
                text("""
                    UPDATE recurring_transactions
                    SET next_due_date = :next_due_date
                    WHERE id = :id
                """),
                {"next_due_date": next_due, "id": recurring.id}
            )
            
            db.commit()
            logger.info(f"Created recurring transaction for user {recurring.user_id}")
    except Exception as e:
        logger.error(f"Error in recurring transaction task: {str(e)}")
        db.rollback()
    finally:
        db.close()

def start_scheduler(settings):
    """Start the APScheduler with all tasks"""
    if not settings.SCHEDULER_ENABLED:
        logger.info("Scheduler is disabled")
        return
    
    # Parse time strings
    daily_summary_hour, daily_summary_minute = map(int, settings.DAILY_SUMMARY_TIME.split(':'))
    budget_check_hour, budget_check_minute = map(int, settings.DAILY_BUDGET_CHECK_TIME.split(':'))
    recurring_check_hour, recurring_check_minute = map(int, settings.RECURRING_CHECK_TIME.split(':'))
    
    # Add daily summary task (9 PM)
    scheduler.add_job(
        daily_summary_task,
        CronTrigger(hour=daily_summary_hour, minute=daily_summary_minute),
        id="daily_summary",
        name="Send daily summary emails",
        replace_existing=True
    )
    
    # Add budget check task (8 AM)
    scheduler.add_job(
        budget_check_task,
        CronTrigger(hour=budget_check_hour, minute=budget_check_minute),
        id="budget_check",
        name="Check budgets and send alerts",
        replace_existing=True
    )
    
    # Add recurring transaction task (6 AM)
    scheduler.add_job(
        recurring_transaction_task,
        CronTrigger(hour=recurring_check_hour, minute=recurring_check_minute),
        id="recurring_transactions",
        name="Create recurring transactions",
        replace_existing=True
    )
    
    scheduler.start()
    logger.info("Scheduler started successfully")

def stop_scheduler():
    """Stop the scheduler"""
    scheduler.shutdown()
    logger.info("Scheduler stopped")
