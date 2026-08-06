import re

file_path = r'c:\timetriq\frontend\src\pages\TimeEntries.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

import_stmt = "import { CustomSelect } from '../components/CustomSelect';\n"
if 'CustomSelect' not in content:
    content = content.replace("import { Search, ChevronDown", import_stmt + "import { Search, ChevronDown")

# Replace Task Filter
task_filter_regex = r'<select value={taskFilter} onChange={e => setTaskFilter\(e\.target\.value\)} style={filterSelectStyle}>\s*<option value=\"All\">All Tasks<\/option>\s*\{uniqueTaskIds\.map\(tid => \(\s*<option key={tid} value={tid}>\{tasks\[tid\]\?\.title \|\| \'Unknown Task\'\}<\/option>\s*\)\)\}\s*<\/select>'
custom_task_filter = '''<CustomSelect 
            value={taskFilter} 
            onChange={setTaskFilter} 
            options={[
              {value: 'All', label: 'All Tasks'},
              ...uniqueTaskIds.map(tid => ({ value: tid, label: tasks[tid]?.title || 'Unknown Task' }))
            ]} 
            buttonStyle={filterSelectStyle} 
          />'''
content = re.sub(task_filter_regex, custom_task_filter, content)

# Replace Tag Filter
tag_filter_regex = r'<select value={tagFilter} onChange={e => setTagFilter\(e\.target\.value\)} style={filterSelectStyle}>\s*<option value=\"All\">All Tags<\/option>\s*\{uniqueTags\.map\(tag => \(\s*<option key={tag} value={tag}>\{tag\}<\/option>\s*\)\)\}\s*<\/select>'
custom_tag_filter = '''<CustomSelect 
            value={tagFilter} 
            onChange={setTagFilter} 
            options={[
              {value: 'All', label: 'All Tags'},
              ...uniqueTags.map(tag => ({ value: tag, label: tag }))
            ]} 
            buttonStyle={filterSelectStyle} 
          />'''
content = re.sub(tag_filter_regex, custom_tag_filter, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Replaced filters in TimeEntries.tsx')
