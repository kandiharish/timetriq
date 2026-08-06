import uuid
from typing import List
from google.cloud.firestore import Client
import app.core.firebase as firebase
from app.models.workspace import (
    SpaceCreate, SpaceInDB, FolderCreate, FolderInDB, 
    ListCreate, ListInDB, HierarchySpace, HierarchyFolder, HierarchyList
)

def _get_db() -> Client:
    if not firebase.db:
        firebase.init_firebase()
    assert firebase.db is not None, "Firestore client not initialized"
    return firebase.db

class WorkspaceService:
    def create_space(self, space: SpaceCreate) -> SpaceInDB:
        db = _get_db()
        space_id = str(uuid.uuid4())
        new_space = SpaceInDB(id=space_id, **space.model_dump())
        db.collection("spaces").document(space_id).set(new_space.model_dump())
        return new_space

    def create_folder(self, folder: FolderCreate) -> FolderInDB:
        db = _get_db()
        folder_id = str(uuid.uuid4())
        new_folder = FolderInDB(id=folder_id, **folder.model_dump())
        db.collection("folders").document(folder_id).set(new_folder.model_dump())
        return new_folder

    def create_list(self, list_data: ListCreate) -> ListInDB:
        db = _get_db()
        list_id = str(uuid.uuid4())
        
        # Verify folder exists to get space_id
        folder_doc = db.collection("folders").document(list_data.folder_id).get()
        if not folder_doc.exists:
            raise ValueError("Folder not found")
        folder = FolderInDB(**{**(folder_doc.to_dict() or {}), "id": folder_doc.id})
        
        new_list = ListInDB(id=list_id, space_id=folder.space_id, **list_data.model_dump())
        db.collection("lists").document(list_id).set(new_list.model_dump())
        return new_list

    def get_hierarchy(self, user_id: str = None, user_role: str = None) -> List[HierarchySpace]:
        db = _get_db()
        spaces_docs = db.collection("spaces").stream()
        folders_docs = db.collection("folders").stream()
        lists_docs = db.collection("lists").stream()

        spaces = [SpaceInDB(**{**(d.to_dict() or {}), "id": d.id}) for d in spaces_docs]
        folders = [FolderInDB(**{**(d.to_dict() or {}), "id": d.id}) for d in folders_docs]
        lists = [ListInDB(**{**(d.to_dict() or {}), "id": d.id}) for d in lists_docs]

        # Apply visibility filtering for Employees
        if user_role and user_role.lower() == "employee" and user_id:
            folders = [f for f in folders if user_id in getattr(f, 'members', [])]

        hierarchy = []
        for s in spaces:
            hs = HierarchySpace(id=s.id, name=s.name)
            s_folders = [f for f in folders if f.space_id == s.id]
            for f in s_folders:
                hf = HierarchyFolder(id=f.id, name=f.name)
                f_lists = [l for l in lists if l.folder_id == f.id]
                for l in f_lists:
                    hf.lists.append(HierarchyList(id=l.id, name=l.name))
                hs.folders.append(hf)
            hierarchy.append(hs)
            
        return hierarchy

    def update_folder_members(self, folder_id: str, members: List[str]):
        db = _get_db()
        doc_ref = db.collection("folders").document(folder_id)
        if not doc_ref.get().exists:
            raise ValueError("Folder not found")
        doc_ref.update({"members": members})
        return doc_ref.get().to_dict()

workspace_service = WorkspaceService()
