from datetime import datetime
import os
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from email.mime.image import MIMEImage
from config import get_settings
from typing import List, Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)
settings = get_settings()

# Enhanced Constant for the PPSJ Financial Solutions premium template
EMAIL_CSS = """
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;700&display=swap');
    
    body { font-family: 'Inter', sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
    .wrapper { background-color: #f1f5f9; padding: 60px 20px; }
    .container { max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
    
    .header { padding: 40px; text-align: center; background-color: #ffffff; border-bottom: 1px solid #e2e8f0; }
    .logo-img { max-width: 200px; height: auto; margin-bottom: 20px; }
    .company-name { font-family: 'Playfair Display', serif; color: #0f172a; font-size: 24px; margin: 0; letter-spacing: 0.05em; text-transform: uppercase; }
    
    .banner { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px; text-align: center; border-left: 6px solid #d4af37; }
    .banner h2 { color: #d4af37; font-size: 14px; text-transform: uppercase; letter-spacing: 0.2em; margin: 0; font-weight: 700; }
    .banner p { color: #94a3b8; font-size: 12px; margin: 8px 0 0 0; font-weight: 500; }
    
    .content { padding: 40px; }
    .content h1 { font-family: 'Playfair Display', serif; font-size: 28px; color: #0f172a; margin: 0 0 20px 0; }
    .content p { font-size: 16px; line-height: 1.6; color: #475569; margin: 0 0 30px 0; }
    
    .card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 30px; margin-bottom: 30px; }
    .card-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin-bottom: 20px; display: block; border-bottom: 1px solid #cbd5e1; padding-bottom: 10px; }
    
    .stat-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .stat-label { color: #64748b; font-size: 15px; font-weight: 500; }
    .stat-value { font-weight: 700; font-size: 20px; color: #0f172a; }
    .value-income { color: #059669; }
    .value-expense { color: #dc2626; }
    
    .data-table { width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 10px; }
    .data-table th { text-align: left; font-size: 11px; color: #94a3b8; text-transform: uppercase; padding: 0 0 15px 0; border-bottom: 1px solid #e2e8f0; }
    .data-table td { font-size: 14px; padding: 15px 0; border-bottom: 1px solid #f1f5f9; color: #334155; }
    .data-table tr:last-child td { border-bottom: none; }
    
    .footer { text-align: center; padding: 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; }
    .footer-text { color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0; }
    .footer-highlight { color: #d4af37; font-weight: 600; }
    
    .btn { display: inline-block; background-color: #0f172a; color: #ffffff !important; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px; margin-top: 20px; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
"""

async def send_email(to_email: str, subject: str, html_content: str, attachment: Optional[bytes] = None, filename: Optional[str] = None):
    """Send an email using SMTP with optional attachment"""
    if not settings.SMTP_ENABLED:
        logger.info(f"Simulating email dispatch to {to_email}: {subject}")
        # Save to local file for visual audit in no-docker mode
        os.makedirs("exports", exist_ok=True)
        dump_path = os.path.join("exports", f"email_preview_{datetime.now().strftime('%H%M%S')}.html")
        with open(dump_path, "w", encoding="utf-8") as f:
            f.write(html_content)
        logger.info(f"Registry fragment dumped to: {dump_path}")
        return
    
    try:
        message = MIMEMultipart("related")
        message["From"] = f"PPSJ Financial Solutions <{settings.SMTP_FROM}>"
        message["To"] = to_email
        message["Subject"] = subject
        
        # Attach HTML
        message.attach(MIMEText(html_content, "html"))
        
        # Attach Logo if exists
        logo_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend-next", "public", "logo.png")
        if os.path.exists(logo_path):
            with open(logo_path, "rb") as f:
                logo_data = f.read()
                logo_part = MIMEImage(logo_data)
                logo_part.add_header("Content-ID", "<logo>")
                logo_part.add_header("Content-Disposition", "inline", filename="logo.png")
                message.attach(logo_part)
        
        if attachment and filename:
            part = MIMEApplication(attachment)
            part.add_header('Content-Disposition', 'attachment', filename=filename)
            message.attach(part)
        
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            use_tls=settings.SMTP_USE_SSL,
            start_tls=settings.SMTP_TLS,
        )
        logger.info(f"Email sent successfully to {to_email}")
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        # Log to file since we can't see terminal
        with open("error_log.txt", "a") as f:
            from datetime import datetime
            f.write(f"{datetime.now()}: Error sending to {to_email}: {str(e)}\n")
        raise e

async def send_welcome_email(email: str):
    """Send welcome email to new user"""
    subject = "Welcome to Obsidian Ledger ₹"
    html_content = f"""
    <html>
        <head><style>{EMAIL_CSS}</style></head>
        <body>
            <div class="wrapper">
                <div class="container">
                    <div class="banner">
                        <h1 class="logo-text">Obsidian Ledger</h1>
                        <p class="banner-sub">QUANTUM FINANCE ACCELERATOR</p>
                    </div>
                    <div class="content">
                        <div class="card">
                            <p style="margin: 0; line-height: 1.8; color: #CBD5E1;">Welcome to your new financial operations center. <strong>Obsidian Ledger</strong> is designed for high-frequency tracking and capital optimization. Your account has been provisioned and is ready for use.</p>
                        </div>
                        <div style="text-align: center;">
                            <a href="#" class="btn">Access Terminal</a>
                        </div>
                    </div>
                    <div class="footer">
                        &copy; {datetime.now().year} Obsidian Capital Intelligence. Locked with 256-bit encryption.
                    </div>
                </div>
            </div>
        </body>
    </html>
    """
    await send_email(email, subject, html_content)

async def send_daily_summary_email(
    email: str, 
    daily_expense: float, 
    daily_income: float, 
    daily_count: int,
    monthly_expense: float,
    monthly_income: float,
    monthly_count: int
):
    """Send daily and monthly spending summary email"""
    subject = f"Vault Report - {datetime.now().strftime('%B %d, %Y')}"
    daily_balance = daily_income - daily_expense
    
    html_content = f"""
    <html>
    <head><style>{EMAIL_CSS}</style></head>
    <body>
        <div class="wrapper">
            <div class="container">
                <div class="header">
                    <img src="cid:logo" class="logo-img" alt="PPSJ Logo" />
                    <h2 class="company-name">PPSJ Financial Solutions</h2>
                </div>
                <div class="banner">
                    <h2>Daily Financial Pulse</h2>
                    <p>Snapshot for {datetime.now().strftime('%d %B %Y')}</p>
                </div>
                <div class="content">
                    <h1>Your Capital Flow Summary</h1>
                    <p>Here's a quick overview of your financial movements for today and the current month.</p>
                    
                    <div class="card">
                        <span class="card-title">Today's Activity</span>
                        <div class="stat-row">
                            <span class="stat-label">Income</span>
                            <span class="stat-value value-income">+₹{daily_income:,.0f}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Expenses</span>
                            <span class="stat-value value-expense">-₹{daily_expense:,.0f}</span>
                        </div>
                        <div class="stat-row" style="border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 15px;">
                            <span class="stat-label">Net Balance</span>
                            <span class="stat-value {'value-income' if daily_balance >= 0 else 'value-expense'}" style="font-size: 24px;">
                                {'▲' if daily_balance >= 0 else '▼'} ₹{abs(daily_balance):,.0f}
                            </span>
                        </div>
                    </div>

                    <div class="card">
                        <span class="card-title">Monthly Overview</span>
                        <div class="stat-row">
                            <span class="stat-label">Total Income</span>
                            <span class="stat-value value-income">+₹{monthly_income:,.0f}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Total Expenses</span>
                            <span class="stat-value value-expense">-₹{monthly_expense:,.0f}</span>
                        </div>
                        <div class="stat-row" style="border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 15px;">
                            <span class="stat-label">Net Monthly Balance</span>
                            <span class="stat-value {'value-income' if (monthly_income - monthly_expense) >= 0 else 'value-expense'}" style="font-size: 24px;">
                                {'▲' if (monthly_income - monthly_expense) >= 0 else '▼'} ₹{abs(monthly_income - monthly_expense):,.0f}
                            </span>
                        </div>
                    </div>
                    
                    <p style="text-align: center; margin-top: 40px;">Stay informed, stay in control. Your financial journey, optimized.</p>
                    <div style="text-align: center;">
                        <a href="#" class="btn">View Full Report</a>
                    </div>
                </div>
                <div class="footer">
                    <p class="footer-text">© {datetime.now().year} <span class="footer-highlight">PPSJ Financial Solutions</span>. Automated Report.</p>
                    <p class="footer-text">Confidential & Secure.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    await send_email(email, subject, html_content)

async def send_export_email(email: str, range_name: str, results: List[dict], attachment: Optional[bytes] = None, filename: Optional[str] = None):
    """Send transaction export email with data or attachment"""
    subject = f"Capital Registry Export: {range_name.upper()}"
    
    table_rows = ""
    # If Today or Week, include a colorful table in email
    if range_name.lower() in ['today', 'week'] and results:
        for r in results[:10]: # Limit to first 10 for email readability
            is_income = r['flow_type'] == 'income'
            color = "#10B981" if is_income else "#F43F5E"
            table_rows += f"""
                <tr>
                    <td>{r['category']}</td>
                    <td>{r['description'] or '-'}</td>
                    <td style="text-align: right; color: {color}; font-weight: 700;">{'₹' if is_income else '-₹'}{r['amount']:,}</td>
                </tr>
            """
    
    data_display = ""
    if table_rows:
        data_display = f"""
            <div class="card">
                <span class="card-title">Recent Activity Registry</span>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Description</th>
                            <th style="text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {table_rows}
                    </tbody>
                </table>
                {f'<p style="font-size: 10px; color: #64748B; margin-top: 15px;">...Showing first 10 records. See attachment for full manifest.</p>' if len(results) > 10 else ''}
            </div>
        """

    html_content = f"""
    <html>
    <head><style>{EMAIL_CSS}</style></head>
    <body>
        <div class="wrapper">
            <div class="container">
                <div class="header">
                    <img src="cid:logo" class="logo-img" alt="PPSJ Logo" />
                    <h2 class="company-name">PPSJ Financial Solutions</h2>
                </div>
                <div class="banner">
                    <h2>Capital Registry Export</h2>
                    <p>Timeline: {range_name.upper()}</p>
                </div>
                <div class="content">
                    <h1>Transaction Manifest</h1>
                    <p>The requested transaction data has been compiled. Below is a high-level summary of your most recent activity.</p>
                    
                    {data_display}

                    <p>The complete archive is attached for your detailed audit.</p>
                    <a href="#" class="btn">View Online Portal</a>
                </div>
                <div class="footer">
                    <p class="footer-text">© {datetime.now().year} <span class="footer-highlight">PPSJ Financial Solutions</span>.</p>
                    <p class="footer-text">This communication is intended solely for the addressee.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    await send_email(email, subject, html_content, attachment, filename)

async def send_budget_alert_email(email: str, category_name: str, spent: float, budget: float, percentage: float):
    """Send budget alert email"""
    subject = f"Warning: Strategy Threshold Triggered"
    is_critical = percentage >= 100
    color = "#F43F5E" if is_critical else "#F59E0B"
    
    html_content = f"""
    <html>
    <head><style>{EMAIL_CSS}</style></head>
    <body>
        <div class="wrapper">
            <div class="container">
                <div class="header">
                    <img src="cid:logo" class="logo-img" alt="PPSJ Logo" />
                    <h2 class="company-name">PPSJ Financial Solutions</h2>
                </div>
                <div class="banner" style="background: {color}; border-left: 6px solid #d4af37;">
                    <h2>Budget Threshold Alert</h2>
                    <p>Category: {category_name.upper()}</p>
                </div>
                <div class="content">
                    <h1>Urgent: Budget Limit Approaching/Exceeded</h1>
                    <p>This is an automated alert to inform you that your spending in the <strong>{category_name}</strong> category has reached a critical level.</p>
                    
                    <div class="card">
                        <span class="card-title">Spending Overview</span>
                        <div class="stat-row">
                            <span class="stat-label">Amount Spent</span>
                            <span class="stat-value">₹{spent:,.0f}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Allocated Budget</span>
                            <span class="stat-value">₹{budget:,.0f}</span>
                        </div>
                        <div class="stat-row" style="border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 15px;">
                            <span class="stat-label">Percentage Used</span>
                            <span class="stat-value" style="color: {color}; font-size: 24px;">{percentage:.1f}%</span>
                        </div>
                    </div>

                    {f'<p style="color: #F43F5E; font-weight: 700;">Action Required: Your budget for {category_name} has been exceeded. Please review your spending or adjust your budget.</p>' if is_critical else '<p>Consider reviewing your spending in this category to stay within your financial plan.</p>'}
                    
                    <div style="text-align: center;">
                        <a href="#" class="btn">Adjust Budget</a>
                    </div>
                </div>
                <div class="footer">
                    <p class="footer-text">© {datetime.now().year} <span class="footer-highlight">PPSJ Financial Solutions</span>. Automated Alert System.</p>
                    <p class="footer-text">Timely insights for optimal financial health.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    await send_email(email, subject, html_content)
