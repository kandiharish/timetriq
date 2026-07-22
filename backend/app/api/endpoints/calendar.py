from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Dict, Any
from datetime import date
from app.api.deps import get_current_user
from app.services import workload_engine

router = APIRouter()

@router.get("/workload", response_model=List[Dict[str, Any]])
def get_workload_distribution(
    start_date: date = Query(..., description="Start date of the range"),
    end_date: date = Query(..., description="End date of the range"),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.get("uid")
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="start_date must be before end_date")
        
    return workload_engine.calculate_daily_workload(user_id, start_date, end_date)
