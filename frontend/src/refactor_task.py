import re

file_path = r'c:\timetriq\frontend\src\components\TaskForm.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

import_stmt = "import { CustomSelect } from './CustomSelect';\n"
if 'CustomSelect' not in content:
    content = content.replace("import { Task }", import_stmt + "import { Task }")

# Replace Status Filter
status_filter_regex = r'<select name=\"status\" value=\{formData\.status\} onChange=\{handleChange\} style=\{\{\.\.\.inputStyle, backgroundColor: \'var\(--color-background\)\'\}\}>\s*<option value=\"Todo\">Todo<\/option>\s*<option value=\"In Progress\">In Progress<\/option>\s*<option value=\"Review\">Review<\/option>\s*<option value=\"Completed\">Completed<\/option>\s*<option value=\"Blocked\">Blocked<\/option>\s*<\/select>'
custom_status_filter = '''<CustomSelect 
              value={formData.status} 
              onChange={(val) => setFormData(prev => ({...prev, status: val}))} 
              options={[
                {value: 'Todo', label: 'Todo'},
                {value: 'In Progress', label: 'In Progress'},
                {value: 'Review', label: 'Review'},
                {value: 'Completed', label: 'Completed'},
                {value: 'Blocked', label: 'Blocked'}
              ]} 
              buttonStyle={{...inputStyle, backgroundColor: 'var(--color-background)'}} 
            />'''
content = re.sub(status_filter_regex, custom_status_filter, content)

# Replace Priority Filter
priority_filter_regex = r'<select name=\"priority\" value=\{formData\.priority\} onChange=\{handleChange\} style=\{\{\.\.\.inputStyle, backgroundColor: \'var\(--color-background\)\'\}\}>\s*<option value=\"Low\">Low<\/option>\s*<option value=\"Medium\">Medium<\/option>\s*<option value=\"High\">High<\/option>\s*<option value=\"Critical\">Critical<\/option>\s*<\/select>'
custom_priority_filter = '''<CustomSelect 
              value={formData.priority} 
              onChange={(val) => setFormData(prev => ({...prev, priority: val}))} 
              options={[
                {value: 'Low', label: 'Low'},
                {value: 'Medium', label: 'Medium'},
                {value: 'High', label: 'High'},
                {value: 'Critical', label: 'Critical'}
              ]} 
              buttonStyle={{...inputStyle, backgroundColor: 'var(--color-background)'}} 
            />'''
content = re.sub(priority_filter_regex, custom_priority_filter, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Replaced filters in TaskForm.tsx')
