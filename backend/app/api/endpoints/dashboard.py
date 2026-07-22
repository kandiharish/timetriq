from fastapi import APIRouter, Depends, HTTPException
from app.api.deps import get_current_user
from app.services import workload_engine

router = APIRouter()

@router.get("/")
def get_dashboard_metrics(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("uid")
    if user_id is None:
        raise HTTPException(status_code=401, detail="User ID not found in token")
    metrics = workload_engine.calculate_dashboard_metrics(user_id)
    return metrics
