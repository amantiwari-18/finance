
import asyncio
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

async def test_smtp():
    host = os.getenv("SMTP_HOST")
    port = int(os.getenv("SMTP_PORT", 465))
    user = os.getenv("SMTP_USER")
    pw = os.getenv("SMTP_PASSWORD")
    sender = os.getenv("SMTP_FROM")
    
    print(f"Testing connection to {host}:{port}")
    print(f"User: {user}")
    print(f"Sender: {sender}")
    
    message = MIMEMultipart()
    message["From"] = sender
    message["To"] = sender # Send to self for test
    message["Subject"] = "Vault SMTP Connectivity Test"
    message.attach(MIMEText("This is a connectivity test for the Obsidian Ledger.", "plain"))
    
    try:
        await aiosmtplib.send(
            message,
            hostname=host,
            port=port,
            username=user,
            password=pw,
            use_tls=(port == 465),
            start_tls=(port == 587)
        )
        print("Success! Connection established and test message dispatched.")
    except Exception as e:
        print(f"Failure: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_smtp())
