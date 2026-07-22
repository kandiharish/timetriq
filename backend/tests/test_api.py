import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.api.deps import get_current_user

# Mock the current user dependency
def override_get_current_user():
    return {"uid": "test_user_123", "email": "test@example.com"}

app.dependency_overrides[get_current_user] = override_get_current_user

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "Timetriq API"}

def test_get_users():
    response = client.get("/api/v1/users/")
    assert response.status_code in [200, 404]

def test_create_and_get_task():
    task_data = {
        "title": "Test Task",
        "description": "This is a test task",
        "estimatedHours": 5,
        "priority": "High",
        "projectId": "proj_123",
        "assignedUserId": "user_123",
        "startDate": "2026-07-21",
        "dueDate": "2026-07-25"
    }
    create_resp = client.post("/api/v1/tasks/", json=task_data)
    
    assert create_resp.status_code in [200, 201], f"Failed to create task: {create_resp.text}"
    
    task_id = create_resp.json().get("id")
    assert task_id is not None
    
    get_resp = client.get(f"/api/v1/tasks/{task_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["title"] == "Test Task"

def test_create_time_entry():
    task_data = {
        "title": "Task for time entry",
        "estimatedHours": 2,
        "projectId": "proj_123",
        "assignedUserId": "user_123",
        "startDate": "2026-07-21",
        "dueDate": "2026-07-25"
    }
    task_resp = client.post("/api/v1/tasks/", json=task_data)
    assert task_resp.status_code in [200, 201]
    task_id = task_resp.json().get("id")
    
    time_entry_data = {
        "task_id": task_id,
        "date": "2026-07-21",
        "hours_worked": 2.5,
        "notes": "Did some work"
    }
    te_resp = client.post("/api/v1/time-entries/", json=time_entry_data)
    assert te_resp.status_code in [200, 201], f"Failed to create time entry: {te_resp.text}"
    
    te_id = te_resp.json().get("id")
    
    list_resp = client.get("/api/v1/time-entries/")
    assert list_resp.status_code == 200
    assert any(te["id"] == te_id for te in list_resp.json())
