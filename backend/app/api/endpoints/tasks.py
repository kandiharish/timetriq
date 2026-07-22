from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.api.deps import get_current_user
from app.models.task import TaskCreate, TaskUpdate, TaskResponse
from app.services import task_service

router = APIRouter()

@router.get("/", response_model=List[TaskResponse])
def get_tasks(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("uid")
    return task_service.get_tasks(user_id)

@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(task_in: TaskCreate, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("uid")
    try:
        return task_service.create_task(user_id, task_in)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("uid")
    task = task_service.get_task(user_id, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: str, task_in: TaskUpdate, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("uid")
    try:
        task = task_service.update_task(user_id, task_id, task_in)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return task
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("uid")
    success = task_service.delete_task(user_id, task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
