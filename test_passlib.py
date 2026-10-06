from passlib.context import CryptContext
try:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    h = pwd_context.hash("test")
    print(f"Hash: {h}")
    print("Success")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
