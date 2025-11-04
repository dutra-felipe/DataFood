from sqlalchemy import create_engine
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10
)

def get_db_connection():
    """Função para obter uma conexão do pool."""
    return engine.connect()