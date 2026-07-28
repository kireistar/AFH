"""
Enum definitions shared across Pydantic schemas.
Values match dengan PostgreSQL ENUM type & DB CHECK constraints.
"""
from enum import Enum


class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"
    MANAGER = "manager"
    FINANCE = "finance"


class EmploymentStatus(str, Enum):
    ACTIVE = "Active"
    ON_LEAVE = "On Leave"
    SUSPENDED = "Suspended"
    RESIGNED = "Resigned"


class RiskTier(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class AssetCategory(str, Enum):
    LAPTOP = "laptop"
    DESKTOP = "desktop"
    MOBILE = "mobile"
    PERIPHERAL = "peripheral"
    PROJECTOR = "projector"
    SERVER = "server"
    NETWORK = "network"
    OTHER = "other"


class AssetCondition(str, Enum):
    GOOD = "good"
    MINOR_DAMAGE = "minor_damage"
    DAMAGED = "damaged"
    LOST = "lost"


class AssetStatus(str, Enum):
    AVAILABLE = "available"
    BORROWED = "borrowed"
    MAINTENANCE = "maintenance"
    RETIRED = "retired"


class RequestStatus(str, Enum):
    PENDING_ADMIN = "pending_admin"
    PENDING_MANAGER = "pending_manager"
    APPROVED = "approved"
    REJECTED = "rejected"
    HANDED_OVER = "handed_over"
    RETURNED = "returned"
    CANCELLED = "cancelled"


class TransactionAction(str, Enum):
    HANDOVER = "handover"
    RETURN = "return"
    INCIDENT_REPORT = "incident_report"
    FINE_ISSUED = "fine_issued"
    FINE_PAID = "fine_paid"
    VERIFICATION = "verification"


class TransactionStatus(str, Enum):
    PENDING = "pending"
    COMMITTED = "committed"
    VERIFIED = "verified"
    TAMPERED = "tampered"


class InvoiceStatus(str, Enum):
    UNPAID = "unpaid"
    PENDING_VERIFICATION = "pending_verification"
    PAID = "paid"
    CANCELLED = "cancelled"


class PaymentMethod(str, Enum):
    BANK_TRANSFER = "bank_transfer"
    CASH = "cash"
    E_WALLET = "e_wallet"
    PAYROLL_DEDUCTION = "payroll_deduction"


class IncidentSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    SEVERE = "severe"
    LOST = "lost"
    CRITICAL = "critical"


class IncidentStatus(str, Enum):
    OPEN = "open"
    INVESTIGATING = "investigating"
    RESOLVED = "resolved"
    CLOSED = "closed"
