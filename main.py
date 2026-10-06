import os, sqlite3, json, jwt, bcrypt
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import FastAPI, Request, HTTPException, Depends, Header
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# === KHET SE - ANTIGRAVITY BACKEND ENGINE ===
# Senior Python Developer Implementation: Optimized, Single-File, Robust.
# Dependencies: pip install fastapi uvicorn PyJWT passlib[bcrypt]

SECRET = "KHETSE_ANTIGRAVITY_BHOPAL_2024"
DB_FILE = "khetse.db"

# --- DATABASE LAYER ---
def get_db_conn():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def setup_database():
    with get_db_conn() as conn:
        conn.execute('''CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT UNIQUE, password TEXT, role TEXT)''')
        conn.execute('''CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT, farmer_id INTEGER, farmer_name TEXT, name TEXT, 
            price REAL, mandiPrice REAL, unit TEXT, category TEXT, emoji TEXT, loc TEXT, 
            organic BOOLEAN, fresh BOOLEAN DEFAULT 1, bg TEXT DEFAULT '#f9f9f9')''')
        conn.execute('''CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, items TEXT, total REAL, 
            date TEXT, status TEXT DEFAULT 'pending', payment_method TEXT, verification_code TEXT)''')
        
        # Seed initial Bhopal-specific data if empty
        if not conn.execute("SELECT 1 FROM products").fetchone():
            seed_data = [
                (1, 'Ramesh Patel', 'Fresh Tomatoes (Tamatar)', 32, 45, 'kg', 'vegetables', '🍅', 'Berasia, Bhopal', 0, 1, '#fff5f5'),
                (1, 'Suresh Verma', 'Desi Aam (Mango)', 120, 160, 'kg', 'fruits', '🥭', 'Phanda, Bhopal', 1, 1, '#fffbf0'),
                (1, 'Kavita Sharma', 'Organic Palak (Spinach)', 28, 40, 'bundle', 'vegetables', '🥬', 'Ratibad, Bhopal', 1, 1, '#f0fff4'),
                (1, 'Gurpreet Jat', 'Sharbati Gehu (Wheat)', 30, 42, 'kg', 'grains', '🌾', 'Hoshangabad Rd, Bhopal', 0, 0, '#fffef5'),
                (1, 'Mohan Yadav', 'Kele (Bananas)', 38, 52, 'dozen', 'fruits', '🍌', 'Mandideep, Bhopal', 0, 1, '#fffef0'),
                (1, 'Bala Krishnan', 'Hari Mirch (Green Chillies)', 55, 75, 'kg', 'vegetables', '🌶️', 'Misrod, Bhopal', 0, 1, '#fff5f0'),
                (1, 'Aarti Devi', 'Desi Ghee', 480, 600, 'kg', 'dairy', '🧈', 'Berasia, Bhopal', 1, 1, '#fffcf0'),
                (1, 'Dinesh Verma', 'Aloo (Potato)', 18, 28, 'kg', 'vegetables', '🥔', 'Vidisha Rd, Bhopal', 0, 1, '#faf5ef'),
                (1, 'Ravi Kumar', 'Tarbooj (Watermelon)', 20, 30, 'kg', 'fruits', '🍉', 'Obaidullaganj, Bhopal', 0, 1, '#fff5f8'),
                (1, 'Mahesh Patidar', 'Pyaz (Red Onion)', 22, 35, 'kg', 'vegetables', '🧅', 'Sehore Rd, Bhopal', 0, 1, '#fff8f5'),
                (1, 'Priya Nair', 'Dhaniya (Fresh Coriander)', 20, 30, 'bundle', 'herbs', '🌿', 'Fanda, Bhopal', 1, 1, '#f0fff7'),
                (1, 'Rajendra Jat', 'Makka (Maize)', 22, 32, 'kg', 'grains', '🌽', 'Raisen Rd, Bhopal', 0, 0, '#fffaf5')
            ]
            conn.executemany("INSERT INTO products (farmer_id, farmer_name, name, price, mandiPrice, unit, category, emoji, loc, organic, fresh, bg) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", seed_data)
        conn.commit()

setup_database()

# --- APP INITIALIZATION ---
antigravity = FastAPI(title="KhetSe Antigravity Edition")
antigravity.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# --- DATA SCHEMAS ---
class AuthSchema(BaseModel):
    email: str
    password: str
    name: Optional[str] = None
    role: Optional[str] = "consumer"

class ProductSchema(BaseModel):
    name: str
    cat: str
    price: float
    qty: Optional[int] = 0
    loc: str
    organic: bool
    farmer: str
    mandiPrice: float
    emoji: str
    unit: str

class OrderSchema(BaseModel):
    items: List[dict]
    total: float
    payment_method: str
    verification_code: Optional[str] = None

# --- AUTH HELPERS ---
def create_token(user_id: int):
    return jwt.encode({"uid": user_id, "exp": datetime.utcnow() + timedelta(days=7)}, SECRET, algorithm="HS256")

async def get_user(x_auth_token: str = Header(None)):
    if not x_auth_token: raise HTTPException(401, "Authentication token missing")
    try:
        payload = jwt.decode(x_auth_token, SECRET, algorithms=["HS256"])
        with get_db_conn() as conn:
            user = conn.execute("SELECT id, name, email, role FROM users WHERE id = ?", (payload["uid"],)).fetchone()
            if not user: raise HTTPException(401, "User session expired")
            return dict(user)
    except: raise HTTPException(401, "Invalid or expired token")

# --- API ENDPOINTS ---

@antigravity.post("/api/auth/register")
@antigravity.post("/api/signup")
async def signup(u: AuthSchema):
    with get_db_conn() as conn:
        try:
            hashed = bcrypt.hashpw(u.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            cur = conn.execute("INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)", 
                               (u.name, u.email, hashed, u.role))
            uid = cur.lastrowid
            token = create_token(uid)
            return {"token": token, "user": {"id": uid, "name": u.name, "email": u.email, "role": u.role}}
        except sqlite3.IntegrityError: raise HTTPException(400, "User with this email already exists")

@antigravity.post("/api/auth/login")
@antigravity.post("/api/login")
async def login(u: AuthSchema):
    with get_db_conn() as conn:
        user = conn.execute("SELECT * FROM users WHERE email = ?", (u.email,)).fetchone()
        if not user or not bcrypt.checkpw(u.password.encode('utf-8'), user["password"].encode('utf-8')): 
            raise HTTPException(400, "Invalid email or password")
        token = create_token(user["id"])
        return {"token": token, "user": {"id": user["id"], "name": user["name"], "email": user["email"], "role": user["role"]}}

@antigravity.get("/api/products")
async def fetch_products():
    with get_db_conn() as conn:
        products = conn.execute("SELECT * FROM products").fetchall()
        res = []
        for p in products:
            p_dict = dict(p)
            p_dict["id"] = str(p_dict["id"])  # Ensure ID is a string for JS === comparison
            p_dict["_id"] = p_dict["id"]     # Fallback for script.js
            p_dict["farmer"] = p_dict.pop("farmer_name")
            res.append(p_dict)
        return res

@antigravity.post("/api/products")
async def add_product(p: ProductSchema, user=Depends(get_user)):
    if user["role"] != "farmer": raise HTTPException(403, "Authorization denied: Only farmers can list products")
    with get_db_conn() as conn:
        conn.execute("INSERT INTO products (farmer_id, farmer_name, name, price, mandiPrice, unit, category, emoji, loc, organic) VALUES (?,?,?,?,?,?,?,?,?,?)",
                     (user["id"], user["name"], p.name, p.price, p.mandiPrice, p.unit, p.cat, p.emoji, p.loc, p.organic))
        conn.commit()
        return {"status": "success", "message": "Product listed successfully"}

@antigravity.get("/api/farmer/stats")
async def get_farmer_stats(user=Depends(get_user)):
    if user["role"] != "farmer":
        raise HTTPException(403, "Only farmers can access stats")
    
    with get_db_conn() as conn:
        # 1. Active Listings
        listings_count = conn.execute("SELECT COUNT(*) FROM products WHERE farmer_id = ?", (user["id"],)).fetchone()[0]
        
        # 2. Orders and Earnings
        # We need to scan all orders because a single order can have items from multiple farmers
        all_orders = conn.execute("SELECT items, status FROM orders").fetchall()
        
        active_orders = 0
        total_earnings = 0
        
        for row in all_orders:
            items = json.loads(row["items"])
            order_status = row["status"]
            
            farmer_items_in_order = [it for it in items if str(it.get("farmer_id")) == str(user["id"])]
            
            if farmer_items_in_order:
                if order_status != "cancelled":
                    active_orders += 1
                    for it in farmer_items_in_order:
                        total_earnings += float(it["price"]) * int(it["qty"])
        
        return {
            "activeListings": listings_count,
            "activeOrders": active_orders,
            "totalEarnings": total_earnings
        }

@antigravity.get("/api/orders")
async def fetch_orders(user=Depends(get_user)):
    with get_db_conn() as conn:
        orders = conn.execute("SELECT * FROM orders WHERE user_id = ?", (user["id"],)).fetchall()
        return [{"orderId": f"KS{o['id']}", "date": o["date"], "status": o["status"], "total": o["total"], "items": json.loads(o["items"])} for o in orders]

@antigravity.post("/api/orders")
async def place_order(o: OrderSchema, user=Depends(get_user)):
    with get_db_conn() as conn:
        conn.execute("INSERT INTO orders (user_id, items, total, date, payment_method, verification_code) VALUES (?,?,?,?,?,?)",
                     (user["id"], json.dumps(o.items), o.total, datetime.now().strftime("%Y-%m-%d %H:%M"), o.payment_method, o.verification_code))
        conn.commit()
        return {"status": "success", "message": "Order processed successfully"}

# --- STATIC CONTENT ENGINE ---
@antigravity.get("/")
async def index():
    return FileResponse("index.html")

@antigravity.get("/{path:path}")
async def static_files(path: str):
    if os.path.exists(path):
        return FileResponse(path)
    # SPA Fallback
    return FileResponse("index.html")

if __name__ == "__main__":
    import uvicorn
    print("KhetSe Antigravity Backend starting on http://localhost:5000")
    uvicorn.run(antigravity, host="0.0.0.0", port=5000)
