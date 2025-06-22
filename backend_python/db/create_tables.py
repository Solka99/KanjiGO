from backend_python.db.database import engine
from backend_python.db.models import Base  # importuje wszystkie modele

print("Creating tables...")
Base.metadata.create_all(bind=engine)
print("Done.")
