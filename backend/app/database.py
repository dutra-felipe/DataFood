from sqlalchemy import create_engine
from app.core.config import settings

# O 'engine' é o ponto de entrada para o banco de dados.
# Ele gerencia um 'pool' de conexões para que não precisemos
# abrir e fechar conexões para cada requisição.
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True, # Verifica a conexão antes de cada uso
    pool_size=5,        # Número de conexões a manter abertas no pool
    max_overflow=10     # Conexões extras que podem ser abertas sob carga
)

def get_db_connection():
    """Função para obter uma conexão do pool."""
    return engine.connect()