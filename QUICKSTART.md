# Quick Start Commands

## 1. Start Database
```bash
docker-compose up -d
```

## 2. Start Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# Edit .env with your SMTP credentials
uvicorn main:app --reload
```

## 3. Start Frontend (new terminal)
```bash
cd frontend
python -m http.server 8080
```

## 4. Access Application
Open: http://localhost:8080/login.html

## SMTP Configuration (Optional)
Edit `backend/.env`:
```
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com
SMTP_ENABLED=true
```

For Gmail App Password: https://support.google.com/accounts/answer/185833
