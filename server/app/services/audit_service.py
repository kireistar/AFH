from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog

def log_admin_action(
    db: Session,
    actor_id,
    action: str,
    entity_type: str,
    entity_id: str = None,
    details: str = None,
):
    try:
        log_entry = AuditLog(
            actor_id=actor_id,
            action=action,
            entity_type=entity_type,
            entity_id=str(entity_id) if entity_id else None,
            details=details,
        )
        db.add(log_entry)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Failed to log audit action: {e}")
