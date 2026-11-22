import re
from enum import Enum

from pydantic import BaseModel, Field, field_validator


class TransactionType(str, Enum):
    PRODUCT_PURCHASE = "PRODUCT_PURCHASE"
    SERVICE_BOOKING = "SERVICE_BOOKING"
    QUOTE_REQUIRED = "QUOTE_REQUIRED"
    CONSULTATION = "CONSULTATION"
    CUSTOM_ORDER = "CUSTOM_ORDER"
    RENTAL = "RENTAL"
    PRICE_PER_PLATE = "PRICE_PER_PLATE"


def normalise_mobile(value: str) -> str:
    digits = re.sub(r"\D", "", value or "")
    if len(digits) == 12 and digits.startswith("91"):
        digits = digits[2:]
    if not re.fullmatch(r"[6-9]\d{9}", digits):
        raise ValueError("Enter a valid 10-digit Indian mobile number")
    return digits


class MobileModel(BaseModel):
    mobile: str

    @field_validator("mobile")
    @classmethod
    def _mobile(cls, value: str) -> str:
        return normalise_mobile(value)


class OtpRequest(MobileModel):
    pass


class OtpVerify(MobileModel):
    code: str = Field(pattern=r"^\d{6}$")


class VerifiedBuyer(MobileModel):
    buyer_name: str = Field(min_length=2, max_length=80)
    verification_token: str = Field(min_length=10)


class ListingCreate(BaseModel):
    title: str = Field(min_length=3, max_length=160)
    description: str = Field(min_length=20)
    category_id: str
    supplier_id: str | None = None
    transaction_type: TransactionType
    city: str
    starting_price: float | None = Field(default=None, ge=0)


class RequirementCreate(VerifiedBuyer):
    city: str = Field(min_length=2)
    event_date: str
    guest_count: int = Field(gt=0)
    budget: float = Field(gt=0)
    categories: list[str] = Field(min_length=1)
    description: str = Field(min_length=10)


class EnquiryCreate(VerifiedBuyer):
    listing_id: str
    message: str = Field(min_length=10, max_length=2000)
    event_date: str | None = None
    guest_count: int | None = Field(default=None, gt=0)


class LeadUnlock(BaseModel):
    supplier_id: str


class QuoteCreate(BaseModel):
    lead_id: str
    vendor_id: str  # the supplier sending the quotation
    amount: float = Field(gt=0)
    terms: str = Field(min_length=5, max_length=2000)


class PlanChange(BaseModel):
    plan: str


class CartItem(BaseModel):
    listing_id: str
    quantity: int = Field(gt=0)


class BookingCreate(BaseModel):
    listing_id: str
    customer_id: str
    event_date: str
