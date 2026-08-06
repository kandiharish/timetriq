import re
from datetime import datetime

file_path = r'c:\timetriq\frontend\src\pages\Tasks.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add logTimeEndDate to state
state_search = "const [logTimeStartDate, setLogTimeStartDate] = useState(getLocalDatetimeLocal());"
state_replace = """const [logTimeStartDate, setLogTimeStartDate] = useState(getLocalDatetimeLocal());
  const [logTimeEndDate, setLogTimeEndDate] = useState(getLocalDatetimeLocal());"""

if state_search in content and "logTimeEndDate" not in content:
    content = content.replace(state_search, state_replace)

# Update reset inside useEffect
reset_search = """setLogTimeStartDate(getLocalDatetimeLocal());
    if (logTimeTaskId) {"""
reset_replace = """setLogTimeStartDate(getLocalDatetimeLocal());
    setLogTimeEndDate(getLocalDatetimeLocal());
    if (logTimeTaskId) {"""

if reset_search in content:
    content = content.replace(reset_search, reset_replace)

# Update manual time change to calculate end date
# Wait, handleManualTimeBlur exists.
blur_search = """const handleManualTimeBlur = () => {
    const { hours } = parseEstimatedTime(manualTimeInput);
    setManualTimeInput(hours > 0 ? formatHours(hours) : '');
  };"""

blur_replace = """const handleManualTimeBlur = () => {
    const { hours } = parseEstimatedTime(manualTimeInput);
    setManualTimeInput(hours > 0 ? formatHours(hours) : '');
    if (hours > 0 && logTimeStartDate) {
      const start = new Date(logTimeStartDate);
      const end = new Date(start.getTime() + hours * 3600000);
      const tzOffset = end.getTimezoneOffset() * 60000;
      const localEnd = (new Date(end.getTime() - tzOffset)).toISOString().slice(0, 16);
      setLogTimeEndDate(localEnd);
    }
  };
  
  const handleDateBoundsChange = (startStr: string, endStr: string) => {
    setLogTimeStartDate(startStr);
    setLogTimeEndDate(endStr);
    if (startStr && endStr) {
      const start = new Date(startStr);
      const end = new Date(endStr);
      const diffMs = end.getTime() - start.getTime();
      if (diffMs > 0) {
        const hours = diffMs / 3600000;
        setManualTimeInput(hours.toFixed(2) + 'h');
      } else {
        setManualTimeInput('');
      }
    }
  };"""

if blur_search in content:
    content = content.replace(blur_search, blur_replace)

# Update UI section
ui_search = """<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input 
                    type="datetime-local" 
                    value={logTimeStartDate}
                    onChange={e => setLogTimeStartDate(e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #D1D5DB', fontSize: '0.8125rem', outline: 'none', flexShrink: 0 }}
                  />
                  <div style={{ fontSize: '0.8125rem', color: '#4B5563', flex: 1 }}>
                    {(() => {
                       if (!manualTimeInput || !logTimeStartDate) return "Enter duration to see time range";
                       const { hours } = parseEstimatedTime(manualTimeInput);
                       if (hours <= 0) return "Invalid duration";
                       const start = new Date(logTimeStartDate);
                       const end = new Date(start.getTime() + hours * 3600000);
                       return `${start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
                    })()}
                  </div>
                </div>"""

ui_replace = """<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="datetime-local" 
                    value={logTimeStartDate}
                    onChange={e => handleDateBoundsChange(e.target.value, logTimeEndDate)}
                    style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #D1D5DB', fontSize: '0.8125rem', outline: 'none', flex: 1 }}
                  />
                  <span style={{ fontSize: '0.8125rem', color: '#6B7280' }}>to</span>
                  <input 
                    type="datetime-local" 
                    value={logTimeEndDate}
                    onChange={e => handleDateBoundsChange(logTimeStartDate, e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #D1D5DB', fontSize: '0.8125rem', outline: 'none', flex: 1 }}
                  />
                </div>"""

if ui_search in content:
    content = content.replace(ui_search, ui_replace)
else:
    print("Warning: UI block not found!")

# Also, when submitting, let's include end_time for the UI to render correctly if backend accepts it
submit_search = """start_time: logTimeStartDate, // Store full ISO string for UI rendering
                  hours_worked: hours,"""
submit_replace = """start_time: logTimeStartDate, // Store full ISO string for UI rendering
                  end_time: logTimeEndDate,
                  hours_worked: hours,"""
if submit_search in content:
    content = content.replace(submit_search, submit_replace)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Tasks.tsx for two-way date binding.")
