import re
import datetime

file_path = r'c:\timetriq\frontend\src\pages\Tasks.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update imports
content = content.replace("import { timeService } from '../services/timeService';", "import { timeService, type TimeEntry } from '../services/timeService';")
if 'TagIcon' not in content:
    content = content.replace("import { GripVertical", "import { Tag as TagIcon, GripVertical")

# 2. Add Modal States
state_insert_point = r"const \[logTimeTaskId, setLogTimeTaskId\] = useState<string \| null>\(null\);\s*const \[manualTimeInput, setManualTimeInput\] = useState\(\'\'\);"
new_states = """const [logTimeTaskId, setLogTimeTaskId] = useState<string | null>(null);
  const [manualTimeInput, setManualTimeInput] = useState('');
  const [logTimeNotes, setLogTimeNotes] = useState('');
  const [logTimeTags, setLogTimeTags] = useState('');
  
  // Calculate local time for input default
  const getLocalDatetimeLocal = () => {
    const tzOffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzOffset)).toISOString().slice(0, 16);
    return localISOTime;
  };
  const [logTimeStartDate, setLogTimeStartDate] = useState(getLocalDatetimeLocal());
  const [pastTimeEntries, setPastTimeEntries] = useState<TimeEntry[]>([]);
"""
content = re.sub(state_insert_point, new_states, content)

# 3. Update useEffect for modal open
use_effect_regex = r"useEffect\(\(\) => \{\s*setManualTimeInput\(\'\'\);\s*\}, \[logTimeTaskId\]\);"
new_use_effect = """useEffect(() => {
    setManualTimeInput('');
    setLogTimeNotes('');
    setLogTimeTags('');
    setLogTimeStartDate(getLocalDatetimeLocal());
    if (logTimeTaskId) {
      timeService.getTimeEntries(logTimeTaskId).then(setPastTimeEntries).catch(console.error);
    } else {
      setPastTimeEntries([]);
    }
  }, [logTimeTaskId]);

  const handleDeleteTimeEntry = async (entryId: string) => {
    if (window.confirm("Are you sure you want to delete this time entry?")) {
      try {
        await timeService.deleteTimeEntry(entryId);
        setPastTimeEntries(prev => prev.filter(e => e.id !== entryId));
        showToast("Time entry deleted", "success");
        fetchTasks();
      } catch (e: any) {
        showToast(e.message || "Failed to delete entry", "error");
      }
    }
  };
"""
content = re.sub(use_effect_regex, new_use_effect, content)

# 4. Find the Log Time Modal block and replace it
# The modal starts with `{logTimeTaskId && (` and ends with `)}` before `{focusSession && (`
# Let's locate it via regex.
modal_regex = re.compile(r"\{logTimeTaskId && \(\s*<div style=\{\{(.*?)\}\s*\)\}", re.DOTALL)

# Because regex with nested brackets is hard, let's just do a string replacement of a unique chunk.
# Specifically from `<h3 style={{ margin: '0 0 12px 0', fontSize: '1.125rem'` down to `</form>`
# Wait, actually we can replace the entire content inside `<div style={{ backgroundColor: 'white', ... }}>`

old_modal_chunk = """<h3 style={{ margin: '0 0 12px 0', fontSize: '1.125rem', fontWeight: 600, color: '#111827' }}>Log Time Manually</h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.8125rem', color: '#6B7280' }}>
              Logging time for: <strong>{tasks.find(t => t.id === logTimeTaskId)?.title}</strong>
            </p>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const { hours } = parseEstimatedTime(manualTimeInput);
              if (hours <= 0) {
                showToast("Invalid time format (e.g. use 1.5, 2h, or 1h 30m).", "error");
                return;
              }
              
              const form = e.currentTarget;
              const notesVal = (form.elements.namedItem('notes') as HTMLInputElement).value;
              
              try {
                await timeService.createTimeEntry({
                  task_id: logTimeTaskId,
                  date: new Date().toISOString().split('T')[0],
                  hours_worked: hours,
                  notes: notesVal || 'Logged manually'
                });
                showToast("Time logged successfully!", "success");
                setLogTimeTaskId(null);
                fetchTasks();
              } catch (err: any) {
                showToast(err.message || "Failed to log time", "error");
              }
            }}>
              <div style={{ marginBottom: '16px', position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>Time Spent</label>
                <input 
                  required 
                  type="text" 
                  name="time" 
                  placeholder="e.g. 1.5, 2h 30m, 45m" 
                  value={manualTimeInput}
                  onChange={(e) => handleManualTimeChange(e.target.value)}
                  onBlur={handleManualTimeBlur}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '0.875rem', outline: 'none' }} 
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>Notes</label>
                <input type="text" name="notes" placeholder="What did you do?" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '0.875rem', outline: 'none' }} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setLogTimeTaskId(null)} className="btn-paper">Cancel</button>
                <button type="submit" className="btn-paper btn-paper-primary">Log Time</button>
              </div>
            </form>"""

new_modal_chunk = """<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', fontWeight: 600, color: '#111827' }}>Time on all tasks</h3>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6B7280' }}>
                  Logging time for: <strong>{tasks.find(t => t.id === logTimeTaskId)?.title}</strong>
                </p>
              </div>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const { hours } = parseEstimatedTime(manualTimeInput);
              if (hours <= 0) {
                showToast("Invalid time format (e.g. use 1.5, 2h, or 1h 30m).", "error");
                return;
              }
              
              try {
                // Ensure date formatting is correct for the backend (YYYY-MM-DD)
                const dateOnly = logTimeStartDate.split('T')[0];
                
                await timeService.createTimeEntry({
                  task_id: logTimeTaskId,
                  date: dateOnly,
                  start_time: logTimeStartDate, // Store full ISO string for UI rendering
                  hours_worked: hours,
                  notes: logTimeNotes || 'Logged manually',
                  tags: logTimeTags || undefined
                });
                showToast("Time logged successfully!", "success");
                
                // Check Auto-completion
                const task = tasks.find(t => t.id === logTimeTaskId);
                if (task) {
                  const newActualHours = (task.actualHours || 0) + hours;
                  if (task.estimatedHours > 0 && newActualHours >= task.estimatedHours && task.status !== 'Completed') {
                     await handleStatusChange(task.id, 'Completed');
                  } else {
                     fetchTasks();
                  }
                } else {
                  fetchTasks();
                }
                
                // Refresh list directly so user sees it instantly
                timeService.getTimeEntries(logTimeTaskId).then(setPastTimeEntries).catch(console.error);
                
                // Clear inputs
                setManualTimeInput('');
                setLogTimeNotes('');
                setLogTimeTags('');
              } catch (err: any) {
                showToast(err.message || "Failed to log time", "error");
              }
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <input 
                    required 
                    type="text" 
                    placeholder="Enter time (ex: 3h 20m) or start timer" 
                    value={manualTimeInput}
                    onChange={(e) => handleManualTimeChange(e.target.value)}
                    onBlur={handleManualTimeBlur}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.875rem', outline: 'none' }} 
                  />
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                </div>

                <div>
                  <textarea 
                    placeholder="Notes" 
                    value={logTimeNotes}
                    onChange={e => setLogTimeNotes(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.875rem', outline: 'none', resize: 'vertical', minHeight: '60px' }} 
                  />
                </div>
                
                <div>
                  <div style={{ position: 'relative' }}>
                    <TagIcon size={14} color="#9CA3AF" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                      type="text" 
                      placeholder="Add tags" 
                      value={logTimeTags}
                      onChange={e => setLogTimeTags(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px 8px 30px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.875rem', outline: 'none' }} 
                    />
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB', paddingBottom: '20px', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.8125rem', color: '#6B7280' }}>
                  {(() => {
                    const totalHours = pastTimeEntries.reduce((acc, e) => acc + (e.hours_worked || 0), 0);
                    return `Total logged: ${formatHoursCompact(totalHours)}`;
                  })()}
                </span>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" onClick={() => setLogTimeTaskId(null)} className="btn-paper">Close</button>
                  <button type="submit" className="btn-paper btn-paper-primary">Save</button>
                </div>
              </div>
            </form>
            
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', margin: '0 0 12px 0' }}>Time Entries</h4>
              {pastTimeEntries.length === 0 ? (
                <div style={{ fontSize: '0.8125rem', color: '#9CA3AF', textAlign: 'center', padding: '12px 0' }}>No time entries found for this task.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {pastTimeEntries.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(entry => (
                    <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '6px', backgroundColor: '#F9FAFB' }}>
                      <div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#111827', marginBottom: '4px' }}>
                           {new Date(entry.start_time || entry.date).toLocaleDateString([], {weekday: 'short', month: 'short', day: 'numeric'})}
                           {entry.start_time && (
                             <span style={{ color: '#6B7280', marginLeft: '6px', fontWeight: 400 }}>
                               {new Date(entry.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                             </span>
                           )}
                        </div>
                        {entry.notes && <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{entry.notes}</div>}
                        {entry.tags && <div style={{ fontSize: '0.7rem', color: '#4F46E5', marginTop: '4px' }}>#{entry.tags}</div>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                         <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>{formatHoursCompact(entry.hours_worked)}</span>
                         <button onClick={() => handleDeleteTimeEntry(entry.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                           <Trash2 size={14} color="#EF4444" />
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>"""

if old_modal_chunk in content:
    content = content.replace(old_modal_chunk, new_modal_chunk)
else:
    print("WARNING: Could not find old modal chunk to replace.")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Replaced Log Time modal in Tasks.tsx')
