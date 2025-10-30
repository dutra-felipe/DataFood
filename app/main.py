from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import AnalyticsQuery
from app.services.query_builder import QueryBuilder
from app.database import get_db_connection
from sqlalchemy.exc import SQLAlchemyError

# Cria a instância da aplicação FastAPI
app = FastAPI(
    title="DataFood Analytics API",
    description="API para analytics customizável para restaurantes.",
    version="1.0.0"
)

# Adiciona o middleware de CORS para permitir que o frontend
# (que estará em um domínio diferente) possa fazer requisições.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, restrinja para o domínio do seu frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Health Check"])
def read_root():
    """Endpoint raiz para verificar se a API está no ar."""
    return {"status": "ok", "message": "Welcome to Nola Analytics API!"}


@app.post("/api/query", tags=["Analytics"])
def run_analytics_query(query_request: AnalyticsQuery):
    """
    Recebe uma requisição de análise, constrói e executa a query SQL
    e retorna os resultados agregados.
    """
    try:
        # 1. Instancia o construtor com a requisição validada pelo Pydantic
        builder = QueryBuilder(query_request)
        
        # 2. Constrói o objeto da query SQL com SQLAlchemy
        sql_query = builder.build()

        # 3. Obtém uma conexão com o banco de dados
        with get_db_connection() as connection:
            # 4. Executa a query
            result_proxy = connection.execute(sql_query)
            
            # 5. Obtém os nomes das colunas a partir do resultado
            column_names = result_proxy.keys()
            
            # 6. Converte o resultado em uma lista de dicionários (formato JSON amigável)
            results = [dict(zip(column_names, row)) for row in result_proxy.fetchall()]

        return {"data": results}

    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")