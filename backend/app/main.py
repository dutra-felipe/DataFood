from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import AnalyticsQuery
from app.services.query_builder import QueryBuilder
from app.database import get_db_connection, engine
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import text

app = FastAPI(
    title="DataFood Analytics API",
    description="API para analytics customizável para restaurantes.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
        builder = QueryBuilder(query_request)
        
        sql_query = builder.build()

        with get_db_connection() as connection:
            result_proxy = connection.execute(sql_query)
            
            column_names = result_proxy.keys()
            
            results = [dict(zip(column_names, row)) for row in result_proxy.fetchall()]

        return {"data": results}

    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

@app.get("/api/options/channels", tags=["Options"])
def get_channel_options():
    """
    Retorna uma lista única de todos os nomes de canais.
    Ex: ["iFood", "Rappi", "Presencial"]
    """
    query = text("SELECT DISTINCT name FROM channels ORDER BY name")
    try:
        with engine.connect() as connection:
            result = connection.execute(query)
            channels = [row[0] for row in result]
            return {"data": channels}
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/api/options/stores", tags=["Options"])
def get_store_options():
    """
    Retorna uma lista de todos os nomes de lojas ativas.
    Ex: [{"id": 1, "name": "Loja A"}, {"id": 2, "name": "Loja B"}]
    """
    query = text("SELECT id, name FROM stores WHERE is_active = true ORDER BY name")
    try:
        with engine.connect() as connection:
            result = connection.execute(query)
            stores = [{"id": row[0], "name": row[1]} for row in result]
            return {"data": stores}
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/api/options/sale_status", tags=["Options"])
def get_sale_status_options():
    """
    Retorna uma lista única de todos os status de venda.
    Ex: ["COMPLETED", "CANCELED"]
    """
    query = text("SELECT DISTINCT sale_status_desc FROM sales ORDER BY sale_status_desc")
    try:
        with engine.connect() as connection:
            result = connection.execute(query)
            statuses = [row[0] for row in result]
            return {"data": statuses}
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/api/options/products", tags=["Options"])
def get_product_options():
    """
    Retorna uma lista de todos os produtos.
    Ex: [{"id": 1, "name": "Produto A"}, {"id": 2, "name": "Produto B"}]
    """
    query = text("SELECT id, name FROM products ORDER BY name")
    try:
        with engine.connect() as connection:
            result = connection.execute(query)
            products = [{"id": row[0], "name": row[1]} for row in result]
            return {"data": products}
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")