# 💰 Expense Tracker

A comprehensive full-stack expense tracking application with PostgreSQL database, FastAPI backend with SMTP email notifications and APScheduler, and a beautiful dark-themed professional dashboard optimized for bulk data entry.

## Features

### Backend (FastAPI)
- ✅ PostgreSQL database with category/subcategory hierarchy
- ✅ RESTful API with JWT authentication
- ✅ SMTP email notifications (daily, weekly, monthly summaries)
- ✅ APScheduler for automated tasks (budget alerts, recurring transactions)
- ✅ Excel import/export functionality
- ✅ Comprehensive analytics and reporting

### Frontend (Dark Theme Dashboard)
- ✅ Beautiful dark theme with glassmorphism effects
- ✅ Responsive dashboard with real-time stats
- ✅ Bulk entry form for adding multiple transactions at once
- ✅ Interactive charts (Chart.js) for spending analysis
- ✅ Category and subcategory management
- ✅ Transaction filtering and search
- ✅ Excel file import

## Tech Stack

**Backend:**
- FastAPI
- PostgreSQL
- SQLAlchemy ORM
- APScheduler
- SMTP (aiosmtplib)
- JWT Authentication

**Frontend:**
- HTML5, CSS3, JavaScript (Vanilla)
- Chart.js for data visualization
- Inter font family
- Glassmorphism design

## Installation

### Prerequisites
- Python 3.9+
- PostgreSQL (or Docker)
- Node.js (optional, for serving frontend)

### 1. Clone or Navigate to Project

```bash
cd C:\Users\Sunil\.gemini\antigravity\scratch\expense-tracker
```

### 2. Set Up Database

**Option A: Using Docker (Recommended)**
```bash
docker-compose up -d
```

**Option B: Using Local PostgreSQL**
1. Install PostgreSQL
2. Create database:
```sql
CREATE DATABASE expense_tracker;
```

### 3. Set Up Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from example
copy .env.example .env

# Edit .env file with your settings (especially SMTP credentials)
notepad .env
```

**Important: Configure SMTP in .env file**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com
SMTP_ENABLED=true
```

For Gmail, you need to create an [App Password](https://support.google.com/accounts/answer/185833).

### 4. Run Backend

```bash
# Make sure you're in the backend directory
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

### 5. Run Frontend

**Option A: Using Python HTTP Server**
```bash
cd frontend
python -m http.server 8080
```

**Option B: Using Node.js HTTP Server**
```bash
cd frontend
npx http-server -p 8080
```

**Option C: Open directly in browser**
```bash
# Just open the file in your browser
start frontend/login.html
```

Access the application at `http://localhost:8080/login.html`

## Usage

### First Time Setup

1. **Register an Account**
   - Open `http://localhost:8080/login.html`
   - Click "Register" and create an account
   - You'll receive a welcome email (if SMTP is configured)

2. **Default Categories**
   - The system creates default categories on registration:
     - Transportation 🚗
     - Food & Dining 🍔
     - Shopping 🛍️
     - Entertainment 🎬
     - Bills & Utilities 💡
     - Salary 💰
     - Investments 📈

3. **Add Subcategories**
   - Click "Manage Categories"
   - Add subcategories to your categories (e.g., Transportation → Gas/fuel - vehicle 1, Insurance - vehicle 1, etc.)

4. **Add Transactions**
   - **Single Entry**: Click "+ Add Transaction"
   - **Bulk Entry**: Click "+ Bulk Entry" to add multiple transactions at once
   - **Import Excel**: Click "Import Excel" to upload your existing data

### Bulk Entry Tips

The bulk entry form is optimized for fast data entry:
- Press Tab to move between fields
- Click "+ Add Row" to add more entries
- All rows are saved at once
- Date defaults to current time

### Excel Import Format

Your Excel file should have these columns:
- **Date** (required) - Date of transaction
- **Category** (required) - Category name
- **Subcategory** (required) - Subcategory name
- **Amount** (required) - Transaction amount
- **Description** (optional) - Transaction description

The system will automatically create categories and subcategories if they don't exist.

### Email Notifications

If SMTP is enabled, you'll receive:
- **Daily Summary** - Every day at 9 PM with your daily spending
- **Weekly Summary** - Every Sunday at 9 PM
- **Monthly Summary** - 1st of each month at 9 PM
- **Budget Alerts** - When you reach 80% or exceed your budget

### Scheduled Tasks

APScheduler runs these tasks automatically:
- **Daily Budget Check** - 8 AM
- **Daily Summary Email** - 9 PM
- **Recurring Transaction Creation** - 6 AM
- **Weekly Summary** - Sunday 9 PM
- **Monthly Summary** - 1st of month, 9 PM

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Categories
- `GET /api/categories` - Get all categories with subcategories
- `POST /api/categories` - Create new category

### Subcategories
- `GET /api/subcategories` - Get all subcategories
- `POST /api/subcategories` - Create new subcategory

### Transactions
- `GET /api/transactions` - Get transactions (with filters)
- `POST /api/transactions` - Create single transaction
- `POST /api/transactions/bulk` - Create multiple transactions
- `PUT /api/transactions/{id}` - Update transaction
- `DELETE /api/transactions/{id}` - Delete transaction

### Analytics
- `GET /api/analytics/summary` - Get spending summary

### Import
- `POST /api/import/excel` - Import from Excel file

Full API documentation available at `http://localhost:8000/docs`

## Project Structure

```
expense-tracker/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration
│   ├── database.py          # Database connection
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── auth.py              # Authentication
│   ├── email_service.py     # SMTP email service
│   ├── scheduler.py         # APScheduler tasks
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Environment variables template
├── frontend/
│   ├── index.html           # Main dashboard
│   ├── login.html           # Login/register page
│   ├── css/
│   │   └── styles.css       # Dark theme styles
│   └── js/
│       ├── api.js           # API client
│       ├── auth.js          # Authentication logic
│       └── app.js           # Dashboard logic
└── docker-compose.yml       # PostgreSQL Docker setup
```

## Troubleshooting

### Database Connection Error
- Make sure PostgreSQL is running
- Check DATABASE_URL in .env file
- If using Docker: `docker-compose ps` to check status

### SMTP Not Working
- Verify SMTP credentials in .env
- For Gmail, use App Password, not regular password
- Set `SMTP_ENABLED=true` in .env

### Frontend Can't Connect to Backend
- Make sure backend is running on port 8000
- Check browser console for CORS errors
- Verify API_BASE_URL in `frontend/js/api.js`

### Scheduler Not Running
- Check backend logs for scheduler initialization
- Set `SCHEDULER_ENABLED=true` in .env
- Verify time format in .env (HH:MM)

## Development

### Running Tests
```bash
cd backend
pytest tests/ -v
```

### Database Migrations
The application automatically creates tables on startup. To reset:
```bash
# Connect to PostgreSQL
psql -U postgres -d expense_tracker

# Drop all tables
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

## Security Notes

- Change `SECRET_KEY` in .env to a secure random string
- Use HTTPS in production
- Never commit .env file to version control
- Use strong passwords for database and user accounts

## License

This project is for personal use.

## Support

For issues or questions, please check:
1. Backend logs: Check terminal where uvicorn is running
2. Frontend console: Open browser DevTools (F12)
3. Database logs: `docker-compose logs postgres`

---

**Enjoy tracking your expenses! 💰**
