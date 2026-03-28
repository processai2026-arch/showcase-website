from dotenv import load_dotenv
load_dotenv()

import os
import bcrypt
import jwt
import secrets
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import FastAPI, HTTPException, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from contextlib import asynccontextmanager

# JWT Configuration
JWT_ALGORITHM = "HS256"

def get_jwt_secret() -> str:
    return os.environ.get("JWT_SECRET", "fallback-secret-key")

# Password utilities
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

# JWT utilities
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

# Database
client: AsyncIOMotorClient = None
db = None

async def get_db():
    return db

# Auth helper
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

# Admin check
async def get_admin_user(request: Request) -> dict:
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# Admin seeding
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
    os.makedirs("/app/memory", exist_ok=True)
    with open("/app/memory/test_credentials.md", "w") as f:
        f.write("# Test Credentials\n\n")
        f.write("## Admin User\n")
        f.write(f"- Email: {admin_email}\n")
        f.write(f"- Password: {admin_password}\n")
        f.write("- Role: admin\n\n")
        f.write("## Auth Endpoints\n")
        f.write("- POST /api/auth/register\n")
        f.write("- POST /api/auth/login\n")
        f.write("- POST /api/auth/logout\n")
        f.write("- GET /api/auth/me\n")
        f.write("- POST /api/auth/refresh\n")

# Lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    global client, db
    client = AsyncIOMotorClient(os.environ.get("MONGO_URL", "mongodb://localhost:27017"))
    db = client[os.environ.get("DB_NAME", "process_ai")]
    
    # Create indexes
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

app = FastAPI(title="Process AI API", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.environ.get("FRONTEND_URL", "http://localhost:3000"),
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
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
    company: Optional[str] = None
    service_type: str
    budget: Optional[str] = None
    message: str
    preferred_date: str

class ServiceModel(BaseModel):
    title: str
    description: str
    icon: str
    features: list[str]
    order: int = 0

class ProjectModel(BaseModel):
    title: str
    description: str
    image_url: str
    category: str
    technologies: list[str]
    link: Optional[str] = None
    order: int = 0

class ContentModel(BaseModel):
    key: str
    value: dict

# Health check
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "Process AI API"}

# Auth endpoints
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
    
    # Check brute force
    attempt = await db.login_attempts.find_one({"identifier": identifier})
    if attempt and attempt.get("count", 0) >= 5:
        lockout_time = attempt.get("last_attempt", datetime.now(timezone.utc))
        if datetime.now(timezone.utc) - lockout_time < timedelta(minutes=15):
            raise HTTPException(status_code=429, detail="Too many attempts. Try again in 15 minutes.")
        else:
            await db.login_attempts.delete_one({"identifier": identifier})
    
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(request.password, user["password_hash"]):
        # Increment failed attempts
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$inc": {"count": 1}, "$set": {"last_attempt": datetime.now(timezone.utc)}},
            upsert=True
        )
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Clear failed attempts
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

# Booking endpoints
@app.post("/api/bookings")
async def create_booking(booking: BookingRequest):
    result = await db.bookings.insert_one({
        **booking.model_dump(),
        "status": "pending",
        "created_at": datetime.now(timezone.utc)
    })
    return {"id": str(result.inserted_id), "message": "Booking submitted successfully"}

@app.get("/api/bookings")
async def get_bookings(request: Request):
    await get_admin_user(request)
    bookings = await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    # Convert ObjectId to string if needed
    for b in bookings:
        if "_id" in b:
            b["id"] = str(b["_id"])
    return bookings

@app.patch("/api/bookings/{booking_id}/status")
async def update_booking_status(booking_id: str, status: dict, request: Request):
    await get_admin_user(request)
    await db.bookings.update_one(
        {"_id": ObjectId(booking_id)},
        {"$set": {"status": status.get("status", "pending")}}
    )
    return {"message": "Status updated"}

# Services endpoints (public read, admin write)
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

# Projects endpoints (public read, admin write)
@app.get("/api/projects")
async def get_projects():
    projects = await db.projects.find({}).sort("order", 1).to_list(100)
    for p in projects:
        p["id"] = str(p["_id"])
        del p["_id"]
    return projects

@app.post("/api/projects")
async def create_project(project: ProjectModel, request: Request):
    await get_admin_user(request)
    result = await db.projects.insert_one(project.model_dump())
    return {"id": str(result.inserted_id), "message": "Project created"}

@app.put("/api/projects/{project_id}")
async def update_project(project_id: str, project: ProjectModel, request: Request):
    await get_admin_user(request)
    await db.projects.update_one(
        {"_id": ObjectId(project_id)},
        {"$set": project.model_dump()}
    )
    return {"message": "Project updated"}

@app.delete("/api/projects/{project_id}")
async def delete_project(project_id: str, request: Request):
    await get_admin_user(request)
    await db.projects.delete_one({"_id": ObjectId(project_id)})
    return {"message": "Project deleted"}

# Content/CMS endpoints (for homepage content, etc.)
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

# Site settings
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
