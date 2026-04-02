from dotenv import load_dotenv
load_dotenv()

import os
import bcrypt
import jwt
import smtplib
import cloudinary
import cloudinary.uploader
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import FastAPI, HTTPException, Request, Response, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from contextlib import asynccontextmanager

# ─── JWT Configuration ────────────────────────────────────────────────────────
JWT_ALGORITHM = "HS256"

def get_jwt_secret() -> str:
    return os.environ.get("JWT_SECRET", "fallback-secret-key")

# ─── Cloudinary Configuration ─────────────────────────────────────────────────
cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME"),
    api_key=os.environ.get("CLOUDINARY_API_KEY"),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET"),
    secure=True
)

# ─── Gmail SMTP Configuration ────────────────────────────────────────────────
GMAIL_USER = os.environ.get("GMAIL_USER", "")
GMAIL_APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD", "")
NOTIFICATION_EMAIL = os.environ.get("NOTIFICATION_EMAIL", "")

def send_email(to: str, subject: str, html: str):
    """Send email via Gmail SMTP. Works for any recipient — no domain needed."""
    if not GMAIL_USER or not GMAIL_APP_PASSWORD:
        print("[Email] Gmail credentials not configured — skipping email")
        return
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"Process AI <{GMAIL_USER}>"
        msg["To"] = to
        msg.attach(MIMEText(html, "html"))
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
            server.sendmail(GMAIL_USER, to, msg.as_string())
        print(f"[Email] Sent to {to}: {subject}")
    except Exception as e:
        print(f"[Email] Failed to send to {to}: {e}")

# ─── Password Utilities ───────────────────────────────────────────────────────
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

# ─── JWT Utilities ────────────────────────────────────────────────────────────
def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=15),
        "type": "access"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "refresh"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

# ─── Database ─────────────────────────────────────────────────────────────────
client: AsyncIOMotorClient = None
db = None

async def get_db():
    return db

# ─── Auth Helpers ─────────────────────────────────────────────────────────────
async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(request: Request) -> dict:
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ─── Email Helpers ────────────────────────────────────────────────────────────
def send_booking_confirmation(booking: dict):
    """Send confirmation email directly to the client."""
    client_email = booking.get("email")
    client_name = booking.get("name")
    service = booking.get("service", "")
    preferred_date = booking.get("preferredDate", "")
    send_email(
        to=client_email,
        subject="Booking Received — Process AI",
        html=f"""
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #050508; color: #fff; padding: 40px; border-radius: 12px;">
            <h1 style="color: #22d3ee; margin-bottom: 8px;">Process AI</h1>
            <h2 style="color: #fff; font-weight: 600;">Your booking request has been received!</h2>
            <p style="color: #9ca3af;">Hi {client_name},</p>
            <p style="color: #9ca3af;">We've received your request and will get back to you within 24 hours.</p>
            <div style="background: #0a0a0f; border: 1px solid #1f2937; border-radius: 8px; padding: 24px; margin: 24px 0;">
                <p style="color: #9ca3af; margin: 0 0 8px;"><strong style="color: #fff;">Service:</strong> {service}</p>
                <p style="color: #9ca3af; margin: 0 0 8px;"><strong style="color: #fff;">Preferred Date:</strong> {preferred_date}</p>
                <p style="color: #9ca3af; margin: 0;"><strong style="color: #fff;">Status:</strong> <span style="color: #facc15;">Pending</span></p>
            </div>
            <p style="color: #6b7280; font-size: 14px;">We'll reach out via email or phone to confirm your appointment.</p>
            <p style="color: #6b7280; font-size: 14px;">— The Process AI Team</p>
        </div>
        """
    )

def send_admin_notification(booking: dict):
    """Notify admin when a new booking comes in."""
    if not NOTIFICATION_EMAIL:
        return
    send_email(
        to=NOTIFICATION_EMAIL,
        subject=f"New Booking from {booking.get('name')} — Process AI",
        html=f"""
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #050508; color: #fff; padding: 40px; border-radius: 12px;">
            <h1 style="color: #22d3ee;">New Booking Received</h1>
            <div style="background: #0a0a0f; border: 1px solid #1f2937; border-radius: 8px; padding: 24px; margin: 24px 0;">
                <p style="color: #9ca3af; margin: 0 0 8px;"><strong style="color: #fff;">Name:</strong> {booking.get('name')}</p>
                <p style="color: #9ca3af; margin: 0 0 8px;"><strong style="color: #fff;">Email:</strong> {booking.get('email')}</p>
                <p style="color: #9ca3af; margin: 0 0 8px;"><strong style="color: #fff;">Phone:</strong> {booking.get('phone', 'N/A')}</p>
                <p style="color: #9ca3af; margin: 0 0 8px;"><strong style="color: #fff;">Service:</strong> {booking.get('service')}</p>
                <p style="color: #9ca3af; margin: 0 0 8px;"><strong style="color: #fff;">Date:</strong> {booking.get('preferredDate')}</p>
                <p style="color: #9ca3af; margin: 0;"><strong style="color: #fff;">Message:</strong> {booking.get('message')}</p>
            </div>
            <p style="color: #6b7280; font-size: 14px;">Login to your admin panel to manage this booking.</p>
        </div>
        """
    )

def send_status_update_email(booking: dict, new_status: str):
    """Send status update email directly to the client."""
    status_color = {"confirmed": "#22d3ee", "rejected": "#ef4444", "pending": "#facc15"}.get(new_status, "#facc15")
    status_message = {
        "confirmed": "Great news! Your booking has been confirmed. We look forward to working with you.",
        "rejected": "Unfortunately, we're unable to accommodate your request at this time. Please feel free to book again with different details.",
        "pending": "Your booking is currently under review. We'll update you soon."
    }.get(new_status, "Your booking status has been updated.")
    send_email(
        to=booking.get("email"),
        subject=f"Booking {new_status.capitalize()} — Process AI",
        html=f"""
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #050508; color: #fff; padding: 40px; border-radius: 12px;">
            <h1 style="color: #22d3ee; margin-bottom: 8px;">Process AI</h1>
            <h2 style="color: #fff;">Booking Status: <span style="color: {status_color};">{new_status.capitalize()}</span></h2>
            <p style="color: #9ca3af;">Hi {booking.get('name')},</p>
            <p style="color: #9ca3af;">{status_message}</p>
            <div style="background: #0a0a0f; border: 1px solid #1f2937; border-radius: 8px; padding: 24px; margin: 24px 0;">
                <p style="color: #9ca3af; margin: 0 0 8px;"><strong style="color: #fff;">Service:</strong> {booking.get('service')}</p>
                <p style="color: #9ca3af; margin: 0;"><strong style="color: #fff;">Preferred Date:</strong> {booking.get('preferredDate')}</p>
            </div>
            <p style="color: #6b7280; font-size: 14px;">— The Process AI Team</p>
        </div>
        """
    )

# ─── Admin Seeding ────────────────────────────────────────────────────────────
async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@processai.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "ProcessAI@Admin2024")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        hashed = hash_password(admin_password)
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hashed,
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc)
        })
        print(f"Admin user created: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}}
        )
        print(f"Admin password updated: {admin_email}")

    # Write credentials to file
    memory_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "memory")
    os.makedirs(memory_dir, exist_ok=True)
    with open(os.path.join(memory_dir, "test_credentials.md"), "w") as f:
        f.write("# Test Credentials\n\n")
        f.write("## Admin User\n")
        f.write(f"- Email: {admin_email}\n")
        f.write(f"- Password: {admin_password}\n")
        f.write("- Role: admin\n\n")

# ─── Lifespan ─────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    global client, db
    client = AsyncIOMotorClient(os.environ.get("MONGO_URL", "mongodb://localhost:27017"))
    db = client[os.environ.get("DB_NAME", "process_ai")]

    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)
    await db.bookings.create_index("created_at")
    await db.projects.create_index("order")
    await db.services.create_index("order")

    await seed_admin()
    print("Process AI Backend Started")
    yield
    client.close()

# ─── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(title="Process AI API", lifespan=lifespan)

# Uploads folder
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# CORS
frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
cors_origins = [
    frontend_url,
    "http://localhost:3000",
    "https://4b531a68-a1b6-4d5f-b8fd-e8f830b480b5.preview.emergentagent.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Pydantic Models ──────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class BookingRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str
    service: str
    message: str
    preferredDate: str

class ServiceModel(BaseModel):
    title: str
    description: str
    icon: str
    features: list[str]
    order: int = 0

class ProjectModel(BaseModel):
    title: str
    description: str
    image: str
    link: Optional[str] = None

class ContentModel(BaseModel):
    key: str
    value: dict

# ─── Health ───────────────────────────────────────────────────────────────────
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "Process AI API"}

# ─── Auth Endpoints ───────────────────────────────────────────────────────────
@app.post("/api/auth/register")
async def register(request: RegisterRequest, response: Response):
    email = request.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = hash_password(request.password)
    result = await db.users.insert_one({
        "email": email,
        "password_hash": hashed,
        "name": request.name,
        "role": "user",
        "created_at": datetime.now(timezone.utc)
    })

    user_id = str(result.inserted_id)
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)

    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=900, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")

    return {"id": user_id, "email": email, "name": request.name, "role": "user"}

@app.post("/api/auth/login")
async def login(request: LoginRequest, response: Response, req: Request):
    email = request.email.lower()
    identifier = f"{req.client.host}:{email}"

    attempt = await db.login_attempts.find_one({"identifier": identifier})
    if attempt and attempt.get("count", 0) >= 5:
        lockout_time = attempt.get("last_attempt", datetime.now(timezone.utc))
        if datetime.now(timezone.utc) - lockout_time < timedelta(minutes=15):
            raise HTTPException(status_code=429, detail="Too many attempts. Try again in 15 minutes.")
        else:
            await db.login_attempts.delete_one({"identifier": identifier})

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(request.password, user["password_hash"]):
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$inc": {"count": 1}, "$set": {"last_attempt": datetime.now(timezone.utc)}},
            upsert=True
        )
        raise HTTPException(status_code=401, detail="Invalid credentials")

    await db.login_attempts.delete_one({"identifier": identifier})

    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)

    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=900, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")

    return {"id": user_id, "email": user["email"], "name": user["name"], "role": user["role"]}

@app.post("/api/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out successfully"}

@app.get("/api/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    return user

@app.post("/api/auth/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        access_token = create_access_token(str(user["_id"]), user["email"])
        response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=900, path="/")
        return {"message": "Token refreshed"}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ─── Upload Endpoint ──────────────────────────────────────────────────────────
@app.post("/api/upload")
async def upload_image(request: Request, file: UploadFile = File(...)):
    await get_admin_user(request)
    try:
        contents = await file.read()
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            contents,
            folder="process-ai/projects",
            resource_type="image",
            transformation=[{"width": 800, "height": 600, "crop": "fill", "quality": "auto"}]
        )
        return {"url": result["secure_url"], "public_id": result["public_id"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

# ─── Booking Endpoints ────────────────────────────────────────────────────────
@app.post("/api/bookings")
async def create_booking(booking: BookingRequest):
    doc = {
        "name": booking.name,
        "email": booking.email,
        "phone": booking.phone,
        "service": booking.service,
        "message": booking.message,
        "preferredDate": booking.preferredDate,
        "status": "pending",
        "createdAt": datetime.now(timezone.utc)
    }
    result = await db.bookings.insert_one(doc)

    # Fire emails (non-blocking — don't fail booking if email fails)
    send_booking_confirmation(doc)
    send_admin_notification(doc)

    return {"id": str(result.inserted_id), "message": "Booking submitted successfully"}

@app.get("/api/bookings")
async def get_bookings(request: Request):
    await get_admin_user(request)
    bookings = await db.bookings.find({}).sort("createdAt", -1).to_list(200)
    for b in bookings:
        b["id"] = str(b["_id"])
        del b["_id"]
    return bookings

@app.delete("/api/bookings/{booking_id}")
async def delete_booking(booking_id: str, request: Request):
    await get_admin_user(request)
    await db.bookings.delete_one({"_id": ObjectId(booking_id)})
    return {"message": "Booking deleted"}

@app.patch("/api/bookings/{booking_id}/status")
async def update_booking_status(booking_id: str, body: dict, request: Request):
    await get_admin_user(request)
    new_status = body.get("status", "pending")
    if new_status not in ["pending", "confirmed", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    await db.bookings.update_one(
        {"_id": ObjectId(booking_id)},
        {"$set": {"status": new_status}}
    )

    # Send status update email to client
    send_status_update_email(booking, new_status)

    return {"message": "Status updated"}

# ─── Services Endpoints ───────────────────────────────────────────────────────
@app.get("/api/services")
async def get_services():
    services = await db.services.find({}).sort("order", 1).to_list(100)
    for s in services:
        s["id"] = str(s["_id"])
        del s["_id"]
    return services

@app.post("/api/services")
async def create_service(service: ServiceModel, request: Request):
    await get_admin_user(request)
    result = await db.services.insert_one(service.model_dump())
    return {"id": str(result.inserted_id), "message": "Service created"}

@app.put("/api/services/{service_id}")
async def update_service(service_id: str, service: ServiceModel, request: Request):
    await get_admin_user(request)
    await db.services.update_one(
        {"_id": ObjectId(service_id)},
        {"$set": service.model_dump()}
    )
    return {"message": "Service updated"}

@app.delete("/api/services/{service_id}")
async def delete_service(service_id: str, request: Request):
    await get_admin_user(request)
    await db.services.delete_one({"_id": ObjectId(service_id)})
    return {"message": "Service deleted"}

# ─── Projects Endpoints ───────────────────────────────────────────────────────
@app.get("/api/projects")
async def get_projects():
    projects = await db.projects.find({}).to_list(100)
    for p in projects:
        p["id"] = str(p["_id"])
        del p["_id"]
    return projects

@app.post("/api/projects")
async def create_project(project: ProjectModel, request: Request):
    await get_admin_user(request)
    result = await db.projects.insert_one({
        "title": project.title,
        "description": project.description,
        "image": project.image,
        "link": project.link
    })
    return {"id": str(result.inserted_id), "message": "Project created"}

@app.put("/api/projects/{project_id}")
async def update_project(project_id: str, project: ProjectModel, request: Request):
    await get_admin_user(request)
    await db.projects.update_one(
        {"_id": ObjectId(project_id)},
        {"$set": {
            "title": project.title,
            "description": project.description,
            "image": project.image,
            "link": project.link
        }}
    )
    return {"message": "Project updated"}

@app.delete("/api/projects/{project_id}")
async def delete_project(project_id: str, request: Request):
    await get_admin_user(request)
    await db.projects.delete_one({"_id": ObjectId(project_id)})
    return {"message": "Project deleted"}

# ─── Content / CMS ────────────────────────────────────────────────────────────
@app.get("/api/content/{key}")
async def get_content(key: str):
    content = await db.content.find_one({"key": key}, {"_id": 0})
    return content or {"key": key, "value": {}}

@app.put("/api/content/{key}")
async def update_content(key: str, content: ContentModel, request: Request):
    await get_admin_user(request)
    await db.content.update_one(
        {"key": key},
        {"$set": {"key": key, "value": content.value}},
        upsert=True
    )
    return {"message": "Content updated"}

# ─── Settings ─────────────────────────────────────────────────────────────────
@app.get("/api/settings")
async def get_settings():
    settings = await db.settings.find_one({"key": "site"}, {"_id": 0})
    return settings or {"key": "site", "value": {}}

@app.put("/api/settings")
async def update_settings(settings: dict, request: Request):
    await get_admin_user(request)
    await db.settings.update_one(
        {"key": "site"},
        {"$set": {"key": "site", "value": settings.get("value", {})}},
        upsert=True
    )
    return {"message": "Settings updated"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
