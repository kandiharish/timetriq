import re

file_path = r'c:\timetriq\frontend\src\pages\Calendar.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

import_stmt = "import { CustomSelect } from '../components/CustomSelect';\n"
if 'CustomSelect' not in content:
    content = content.replace("import { ChevronLeft, ChevronRight", import_stmt + "import { ChevronLeft, ChevronRight")

status_filter_regex = r'<select value={statusFilter} onChange={e => setStatusFilter\(e\.target\.value\)} style=\{\{.*?\}\}>\s*<option value=\"All\">All Statuses<\/option>\s*<option value=\"Todo\">Todo<\/option>\s*<option value=\"In Progress\">In Progress<\/option>\s*<option value=\"Review\">Review<\/option>\s*<option value=\"Completed\">Completed<\/option>\s*<\/select>'
custom_status_filter = '''<CustomSelect 
                value={statusFilter} 
                onChange={setStatusFilter} 
                options={[
                  {value: 'All', label: 'All Statuses'},
                  {value: 'Todo', label: 'Todo'},
                  {value: 'In Progress', label: 'In Progress'},
                  {value: 'Review', label: 'Review'},
                  {value: 'Completed', label: 'Completed'}
                ]} 
                buttonStyle={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF', fontSize: '0.75rem', color: '#374151', minWidth: '120px' }} 
             />'''

content = re.sub(status_filter_regex, custom_status_filter, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Replaced filter in Calendar.tsx')
