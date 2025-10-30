from pydantic import BaseModel
from typing import List, Optional, Any
from enum import Enum
from datetime import datetime


class MetricFunction(str, Enum):
    SUM = "sum"
    COUNT = "count"
    AVG = "avg"

class DimensionField(str, Enum):
    PRODUCT_NAME = "product_name"
    CHANNEL_NAME = "channel_name"
    STORE_NAME = "store_name"
    PAYMENT_TYPE = "payment_type"
    SALE_STATUS = "sale_status"
    DAY_OF_WEEK = "day_of_week" # Ex: Segunda, Terça
    HOUR_OF_DAY = "hour_of_day" # Ex: 19h, 20h

class FilterOperator(str, Enum):
    EQUALS = "equals"
    NOT_EQUALS = "not_equals"
    GREATER_THAN = "greater_than"
    LESS_THAN = "less_than"
    IN = "in" # Para listas, ex: canal IN ('iFood', 'Rappi')

class SortDirection(str, Enum):
    ASC = "asc"
    DESC = "desc"

# --- Sub-modelos que compõem a requisição principal ---

class Metric(BaseModel):
    field: str  # A coluna do banco, ex: "total_amount"
    function: MetricFunction
    alias: Optional[str] = None # Nome customizado para o resultado, ex: "faturamento_total"

class Filter(BaseModel):
    field: str # A coluna do banco, ex: "channel_id"
    operator: FilterOperator
    value: Any # O valor pode ser str, int, list, etc.

class OrderBy(BaseModel):
    field: str # A coluna ou alias para ordenar
    direction: SortDirection

class TimeRangeFilter(BaseModel):
    start_date: datetime
    end_date: datetime

# --- O Modelo Principal da Requisição ---

class AnalyticsQuery(BaseModel):
    metrics: List[Metric]
    dimensions: List[DimensionField]
    filters: Optional[List[Filter]] = []
    time_range: Optional[TimeRangeFilter] = None
    order_by: Optional[OrderBy] = None
    limit: Optional[int] = None
