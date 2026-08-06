import re

# Fix Tasks.tsx
file_path = r'c:\timetriq\frontend\src\pages\Tasks.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix CustomSelect import in Tasks.tsx
if 'import { CustomSelect }' not in content:
    content = content.replace("import { formatHoursCompact", "import { CustomSelect } from '../components/CustomSelect';\nimport { formatHoursCompact")

# Fix implicit any for (val) in Tasks.tsx
content = content.replace("onChange={(val) => onStatusChange(task.id, val)}", "onChange={(val: string) => onStatusChange(task.id, val)}")

# Fix filteredTasks
content = content.replace("filteredTasks.length", "baseFilteredTasks.length")
content = content.replace("filteredTasks.map(t =>", "baseFilteredTasks.map(t =>")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

# Fix TaskForm.tsx
file_path = r'c:\timetriq\frontend\src\components\TaskForm.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()
if 'import { CustomSelect }' not in content:
    content = content.replace("import { taskService }", "import { CustomSelect } from './CustomSelect';\nimport { taskService }")
content = content.replace("onChange={(val) => setFormData(prev => ({...prev, status: val}))}", "onChange={(val: string) => setFormData(prev => ({...prev, status: val}))}")
content = content.replace("onChange={(val) => setFormData(prev => ({...prev, priority: val}))}", "onChange={(val: string) => setFormData(prev => ({...prev, priority: val}))}")
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

# Fix TimeEntries.tsx
file_path = r'c:\timetriq\frontend\src\pages\TimeEntries.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()
if 'import { CustomSelect }' not in content:
    content = content.replace("import { Search, ChevronDown", "import { CustomSelect } from '../components/CustomSelect';\nimport { Search, ChevronDown")
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed compilation errors')
