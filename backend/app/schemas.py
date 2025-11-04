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
    SALE_DATE = "sale_date"
    DAY_OF_WEEK = "day_of_week"
    HOUR_OF_DAY = "hour_of_day"

class FilterOperator(str, Enum):
    EQUALS = "equals"
    NOT_EQUALS = "not_equals"
    GREATER_THAN = "greater_than"
    LESS_THAN = "less_than"
    IN = "in"

class SortDirection(str, Enum):
    ASC = "asc"
    DESC = "desc"

class Metric(BaseModel):
    field: str
    function: MetricFunction
    alias: Optional[str] = None

class Filter(BaseModel):
    field: str
    operator: FilterOperator
    value: Any

class OrderBy(BaseModel):
    field: str
    direction: SortDirection

class TimeRangeFilter(BaseModel):
    start_date: datetime
    end_date: datetime

class AnalyticsQuery(BaseModel):
    metrics: List[Metric]
    dimensions: List[DimensionField]
    filters: Optional[List[Filter]] = []
    time_range: Optional[TimeRangeFilter] = None
    order_by: Optional[OrderBy] = None
    limit: Optional[int] = None
