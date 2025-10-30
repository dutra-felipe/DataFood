from sqlalchemy import (
    select,
    func,
    Table,
    MetaData,
    Column,
    Integer,
    String,
    DateTime,
    Numeric,
    desc,
    asc,
)
from app.schemas import AnalyticsQuery, DimensionField, MetricFunction

# ==============================================================================
# 1. MAPEAMENTO DO SCHEMA DO BANCO DE DADOS
# ==============================================================================
# Usamos o SQLAlchemy Core para declarar as tabelas que vamos usar.
# Não precisamos de todas as colunas, apenas as que são relevantes para as análises.
metadata = MetaData()

sales = Table('sales', metadata,
    Column('id', Integer, primary_key=True),
    Column('store_id', Integer),
    Column('channel_id', Integer),
    Column('customer_id', Integer),
    Column('total_amount', Numeric),
    Column('total_discount', Numeric),
    Column('delivery_fee', Numeric),
    Column('created_at', DateTime),
    Column('sale_status_desc', String),
)

stores = Table('stores', metadata,
    Column('id', Integer, primary_key=True),
    Column('name', String),
)

channels = Table('channels', metadata,
    Column('id', Integer, primary_key=True),
    Column('name', String),
)

product_sales = Table('product_sales', metadata,
    Column('id', Integer, primary_key=True),
    Column('sale_id', Integer),
    Column('product_id', Integer),
)

products = Table('products', metadata,
    Column('id', Integer, primary_key=True),
    Column('name', String),
)

payments = Table('payments', metadata,
    Column('id', Integer, primary_key=True),
    Column('sale_id', Integer),
    Column('payment_type_id', Integer),
)

payment_types = Table('payment_types', metadata,
    Column('id', Integer, primary_key=True),
    Column('description', String),
)

# ==============================================================================
# 2. MAPA DE CAMPOS (O TRADUTOR)
# ==============================================================================
# Este dicionário é a peça central que conecta os nomes amigáveis da API
# com as colunas e expressões SQL do banco de dados.
FIELD_MAP = {
    # Dimensões diretas de tabelas
    "store_name": stores.c.name,
    "channel_name": channels.c.name,
    "product_name": products.c.name,
    "payment_type": payment_types.c.description,
    "sale_status": sales.c.sale_status_desc,
    
    # Dimensões calculadas (extraídas da data)
    # 'isodow' é o padrão ISO: 1=Segunda, 7=Domingo
    "day_of_week": func.extract('isodow', sales.c.created_at),
    "hour_of_day": func.extract('hour', sales.c.created_at),

    # Campos para Métricas e Filtros
    "total_amount": sales.c.total_amount,
    "total_discount": sales.c.total_discount,
    "delivery_fee": sales.c.delivery_fee,
    "sale_id": sales.c.id, # Usado para contagens
}

# ==============================================================================
# 3. O CONSTRUTOR DE QUERIES
# ==============================================================================

class QueryBuilder:
    """
    Constrói uma consulta SQL analítica de forma dinâmica e segura
    a partir de um objeto de requisição AnalyticsQuery.
    """
    def __init__(self, query_request: AnalyticsQuery):
        self.request = query_request
        self.query = select().select_from(sales)
        self.joined_tables = {sales} # Começamos sempre com a tabela 'sales'

    def build(self):
        """
        Orquestra a construção da query completa, aplicando cada parte
        na ordem correta para garantir a validade do SQL.
        """
        self._apply_metrics_and_dimensions()
        self._apply_time_range()
        self._apply_filters()
        self._apply_group_by()
        self._apply_order_by()
        self._apply_limit()

        return self.query

    def _apply_metrics_and_dimensions(self):
        """Constrói a parte do SELECT da query (as colunas e agregações)."""
        selections = []

        for dim_enum in self.request.dimensions:
            column = FIELD_MAP.get(dim_enum.value)
            if column is not None:
                selections.append(column.label(dim_enum.value))
                self._ensure_join(column)

        for metric in self.request.metrics:
            column_to_agg = FIELD_MAP.get(metric.field)
            if column_to_agg is None:
                continue

            alias = metric.alias or f"{metric.function}_{metric.field}"
            
            if metric.function == MetricFunction.SUM:
                sql_func = func.sum(column_to_agg).label(alias)
            elif metric.function == MetricFunction.COUNT:
                # Usamos COUNT DISTINCT no id para evitar contagens duplicadas por joins
                sql_func = func.count(func.distinct(column_to_agg)).label(alias)
            elif metric.function == MetricFunction.AVG:
                sql_func = func.avg(column_to_agg).label(alias)
            
            selections.append(sql_func)

        self.query = self.query.with_only_columns(*selections)

    def _apply_time_range(self):
        """Adiciona um filtro de tempo na coluna 'created_at'."""
        if not self.request.time_range:
            return
        
        start = self.request.time_range.start_date
        end = self.request.time_range.end_date
        self.query = self.query.where(sales.c.created_at.between(start, end))

    def _apply_filters(self):
        """Adiciona cláusulas WHERE com base nos filtros da requisição."""
        if not self.request.filters:
            return

        for f in self.request.filters:
            column = FIELD_MAP.get(f.field)
            if column is None:
                continue

            op_map = {
                "equals": lambda c, v: c == v,
                "not_equals": lambda c, v: c != v,
                "greater_than": lambda c, v: c > v,
                "less_than": lambda c, v: c < v,
                "in": lambda c, v: c.in_(v),
            }
            
            if f.operator in op_map:
                condition = op_map[f.operator](column, f.value)
                self.query = self.query.where(condition)
                self._ensure_join(column)

    def _apply_group_by(self):
        """Adiciona a cláusula GROUP BY se houver dimensões na requisição."""
        if not self.request.dimensions:
            return

        group_by_columns = [FIELD_MAP[dim.value] for dim in self.request.dimensions if dim.value in FIELD_MAP]
        if group_by_columns:
            self.query = self.query.group_by(*group_by_columns)

    def _apply_order_by(self):
        """Adiciona a cláusula ORDER BY para ordenar os resultados."""
        if not self.request.order_by:
            return
            
        field_to_order = self.request.order_by.field
        direction = self.request.order_by.direction
        
        # A ordenação pode ser por um alias da métrica ou por um campo de dimensão
        order_obj = FIELD_MAP.get(field_to_order, field_to_order)

        if direction == "asc":
            self.query = self.query.order_by(asc(order_obj))
        else:
            self.query = self.query.order_by(desc(order_obj))
            
    def _apply_limit(self):
        """Adiciona um LIMIT para paginar ou pegar o 'top N'."""
        if self.request.limit and self.request.limit > 0:
            self.query = self.query.limit(self.request.limit)

    def _ensure_join(self, column):
        """
        Adiciona um JOIN à query se a tabela da coluna ainda não foi incluída.
        Lida com joins simples e múltiplos.
        """
        target_table = column.table
        if target_table in self.joined_tables:
            return

        # Lógica de JOIN
        if target_table.name == 'stores':
            self.query = self.query.join(stores, sales.c.store_id == stores.c.id)
        elif target_table.name == 'channels':
            self.query = self.query.join(channels, sales.c.channel_id == channels.c.id)
        elif target_table.name == 'products':
            # Join múltiplo: sales -> product_sales -> products
            if product_sales not in self.joined_tables:
                self.query = self.query.join(product_sales, sales.c.id == product_sales.c.sale_id)
                self.joined_tables.add(product_sales)
            self.query = self.query.join(products, product_sales.c.product_id == products.c.id)
        elif target_table.name == 'payment_types':
             # Join múltiplo: sales -> payments -> payment_types
            if payments not in self.joined_tables:
                self.query = self.query.join(payments, sales.c.id == payments.c.sale_id)
                self.joined_tables.add(payments)
            self.query = self.query.join(payment_types, payments.c.payment_type_id == payment_types.c.id)

        self.joined_tables.add(target_table)
