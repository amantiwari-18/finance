from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List
from models import TransactionType, PeriodType, FrequencyType

# User Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# Category Schemas
class CategoryCreate(BaseModel):
    name: str
    type: TransactionType
    color: Optional[str] = "#6366f1"
    icon: Optional[str] = "💰"

class CategoryResponse(BaseModel):
    id: int
    name: str
    type: TransactionType
    color: str
    icon: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Subcategory Schemas
class SubcategoryCreate(BaseModel):
    name: str
    category_id: int

class SubcategoryResponse(BaseModel):
    id: int
    name: str
    category_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class CategoryWithSubcategories(CategoryResponse):
    subcategories: List[SubcategoryResponse] = []

# Transaction Schemas
class TransactionCreate(BaseModel):
    category_id: int
    subcategory_id: int
    amount: float = Field(..., gt=0)
    date: datetime
    description: Optional[str] = None
    receipt_url: Optional[str] = None

class TransactionBulkCreate(BaseModel):
    transactions: List[TransactionCreate]

class TransactionResponse(BaseModel):
    id: int
    category_id: int
    subcategory_id: int
    amount: float
    date: datetime
    description: Optional[str]
    receipt_url: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class TransactionWithDetails(TransactionResponse):
    category: CategoryResponse
    subcategory: SubcategoryResponse

# Budget Schemas
class BudgetCreate(BaseModel):
    category_id: Optional[int] = None
    subcategory_id: Optional[int] = None
    amount: float = Field(..., gt=0)
    period: PeriodType

class BudgetResponse(BaseModel):
    id: int
    category_id: Optional[int]
    subcategory_id: Optional[int]
    amount: float
    period: PeriodType
    start_date: datetime
    
    class Config:
        from_attributes = True

# Recurring Transaction Schemas
class RecurringTransactionCreate(BaseModel):
    category_id: int
    subcategory_id: int
    amount: float = Field(..., gt=0)
    description: Optional[str] = None
    frequency: FrequencyType
    next_due_date: datetime

class RecurringTransactionResponse(BaseModel):
    id: int
    category_id: int
    subcategory_id: int
    amount: float
    description: Optional[str]
    frequency: FrequencyType
    next_due_date: datetime
    
    class Config:
        from_attributes = True

# Loan Schemas
class LoanCreate(BaseModel):
    name: str
    total_amount: float = Field(..., gt=0)
    interest_rate: Optional[float] = 0.0

class LoanResponse(BaseModel):
    id: int
    name: str
    total_amount: float
    remaining_amount: float
    interest_rate: float
    subcategory_id: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Analytics Schemas
class CategorySummary(BaseModel):
    category_id: int
    category_name: str
    total_amount: float
    transaction_count: int
    budget_amount: Optional[float] = 0.0

class SubcategorySummary(BaseModel):
    subcategory_id: int
    subcategory_name: str
    category_name: str
    total_amount: float
    transaction_count: int

class AnalyticsSummary(BaseModel):
    total_income: float
    total_expense: float
    balance: float
    category_breakdown: List[CategorySummary]
    subcategory_breakdown: List[SubcategorySummary]
