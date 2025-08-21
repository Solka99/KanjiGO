from db.database import engine
from db.models import Base  # importuje wszystkie modele

print("Creating tables...")
Base.metadata.create_all(bind=engine)
print("Done.")
