import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTimer } from '../context/TimerContext';
import { 
  LayoutDashboard, CheckSquare, Calendar, Clock, 
  BarChart2, Settings as SettingsIcon,
  Search, Bell, LogOut, ChevronDown, Hexagon,
  PieChart, Activity, TrendingUp, HelpCircle, Briefcase, Plus, User, X
} from 'lucide-react';

export const Layout: React.FC = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const { timers, stopTimer, getLiveElapsedSeconds, focusSession, stopFocus } = useTimer();
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  
  const [showTimersDropdown, setShowTimersDropdown] = useState(false);
  const timersDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (timersDropdownRef.current && !timersDropdownRef.current.contains(event.target as Node)) {
        setShowTimersDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const runningTimers = Object.entries(timers).filter(([_, t]) => t.startTime !== null);
  const primaryRunningTimer = runningTimers.length > 0 ? runningTimers[0] : null;
  const primaryTaskId = primaryRunningTimer ? primaryRunningTimer[0] : null;
  const primaryLiveSeconds = primaryTaskId ? getLiveElapsedSeconds(primaryTaskId) : 0;

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const mainNavItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
    { name: 'My Tasks', path: '/tasks', icon: <CheckSquare size={18} /> },
    { name: 'Time Tracking', path: '/time-entries', icon: <Clock size={18} /> },
    { name: 'Calendar', path: '/calendar', icon: <Calendar size={18} /> },
    { name: 'Reports', path: '/reports', icon: <BarChart2 size={18} /> },
    { name: 'Workload', path: '/workload', icon: <Activity size={18} /> },
  ];

  const analyticsItems = [
    { name: 'Performance', path: '/performance', icon: <Activity size={18} /> },
    { name: 'Estimates', path: '/estimates', icon: <PieChart size={18} /> },
    { name: 'Trends', path: '/trends', icon: <TrendingUp size={18} /> },
  ];

  const settingsItems = [
    { name: 'Settings', path: '/settings', icon: <SettingsIcon size={18} /> },
    { name: 'Integrations', path: '/integrations', icon: <Briefcase size={18} /> },
  ];

  const renderNavGroup = (items: typeof mainNavItems) => (
    <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {items.map((item) => {
        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
        return (
          <Link 
            key={item.name} 
            to={item.path} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--spacing-3)', 
              padding: '8px 12px', 
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              color: isActive ? 'var(--color-sidebar-text-active)' : 'var(--color-sidebar-text)',
              backgroundColor: isActive ? 'var(--color-sidebar-active-bg)' : 'transparent',
              fontWeight: isActive ? 500 : 400,
              fontSize: '0.875rem',
              transition: 'var(--transition-fast)'
            }}
          >
            <span style={{ color: isActive ? '#FFFFFF' : 'var(--color-sidebar-text)', display: 'flex' }}>
              {item.icon}
            </span>
            {item.name}
          </Link>
        )
      })}
    </nav>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--color-background)', overflow: 'hidden' }}>
      
      {/* Sidebar (Dark Theme) */}
      <aside style={{ 
        width: '220px', 
        backgroundColor: 'var(--color-sidebar-bg)', 
        borderRight: `1px solid var(--color-sidebar-border)`,
        display: 'flex',
        flexDirection: 'column',
        padding: 'var(--spacing-6) var(--spacing-4)',
        zIndex: 10,
        overflowY: 'auto'
      }}>
        {/* Logo Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', padding: '0 var(--spacing-2)', marginBottom: 'var(--spacing-6)' }}>
          <div style={{ color: 'var(--color-primary)', display: 'flex' }}><Hexagon size={24} fill="currentColor" /></div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-sidebar-text-active)', lineHeight: 1.2 }}>Timetriq</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-sidebar-text)', fontWeight: 500 }}>Work Intelligence Platform</div>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
          {renderNavGroup(mainNavItems)}

          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-sidebar-text)', letterSpacing: '0.05em', marginBottom: '8px', paddingLeft: '12px' }}>
              Analytics
            </div>
            {renderNavGroup(analyticsItems)}
          </div>

          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-sidebar-text)', letterSpacing: '0.05em', marginBottom: '8px', paddingLeft: '12px' }}>
              Settings
            </div>
            {renderNavGroup(settingsItems)}
          </div>
        </div>

        {/* Bottom Sidebar Actions */}
        <div style={{ marginTop: 'auto', paddingTop: 'var(--spacing-6)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          {/* Workspace Switcher */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '8px 12px', 
            backgroundColor: 'var(--color-sidebar-surface)', 
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-sidebar-border)',
            cursor: 'pointer'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>
                T
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-sidebar-text)' }}>Workspace</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-sidebar-text-active)', fontWeight: 500 }}>Timetriq Team</div>
              </div>
            </div>
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Top Header */}
        <header style={{ 
          height: '64px', 
          backgroundColor: 'var(--color-surface)', 
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--spacing-6)',
          zIndex: 5
        }}>
          {/* Left: Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-6)' }}>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              backgroundColor: 'var(--color-background)', 
              padding: '6px 12px', 
              borderRadius: 'var(--radius-md)',
              width: '320px',
              border: '1px solid var(--color-border)'
            }}>
              <Search size={16} color="var(--color-text-secondary)" style={{ marginRight: '8px' }} />
              <input 
                type="text" 
                placeholder="Search tasks, projects, users..." 
                style={{ 
                  border: 'none', 
                  background: 'transparent', 
                  outline: 'none', 
                  width: '100%',
                  fontSize: '0.875rem',
                  color: 'var(--color-text-primary)'
                }} 
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
            
            {focusSession && (
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  backgroundColor: '#FEF2F2',
                  color: '#991B1B',
                  padding: '6px 12px', 
                  borderRadius: '20px', 
                  border: '1.5px solid #FCA5A5', 
                  fontSize: '0.75rem', 
                  fontWeight: 600,
                  boxShadow: '1px 1px 0px 0px #7F1D1D',
                  marginRight: '8px'
                }}
              >
                <span style={{ 
                  width: '6px', 
                  height: '6px', 
                  borderRadius: '50%', 
                  backgroundColor: '#DC2626', 
                  animation: 'pulse 1s infinite' 
                }}></span>
                <span style={{ maxWidth: '90px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Focus: {focusSession.taskTitle}
                </span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, backgroundColor: '#FEE2E2', padding: '2px 6px', borderRadius: '10px' }}>
                  {Math.floor(focusSession.timeLeft / 60)}:{(focusSession.timeLeft % 60).toString().padStart(2, '0')}
                </span>
                <button 
                  onClick={stopFocus}
                  title="Quit Focus session"
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: '#DC2626', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '2px',
                    borderRadius: '50%',
                    backgroundColor: '#FEE2E2'
                  }}
                >
                  <X size={10} />
                </button>
              </div>
            )}

            {runningTimers.length > 0 && (
              <div style={{ position: 'relative', marginRight: '8px' }} ref={timersDropdownRef}>
                <button
                  onClick={() => setShowTimersDropdown(!showTimersDropdown)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#FFFBEB',
                    color: '#B45309',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: '1.5px solid #F59E0B',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '1px 1px 0px 0px #78350F',
                    outline: 'none'
                  }}
                  title="View Active Timers"
                >
                  <span style={{ 
                    width: '6px', 
                    height: '6px', 
                    borderRadius: '50%', 
                    backgroundColor: '#DC2626', 
                    animation: 'pulse 1.5s infinite' 
                  }}></span>
                  
                  <span>
                    ({runningTimers.length}) Running
                  </span>
                  
                  <span style={{ fontFamily: 'monospace', opacity: 0.85 }}>
                    {formatTime(getLiveElapsedSeconds(runningTimers[0][0]))}
                  </span>
                  
                  <ChevronDown size={12} color="#B45309" />
                </button>

                {showTimersDropdown && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    marginTop: '8px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    minWidth: '260px',
                    zIndex: 100,
                    overflow: 'hidden'
                  }}>
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid #F3F4F6', backgroundColor: '#F9FAFB', fontSize: '0.7rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                      Active Timers
                    </div>
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {runningTimers.map(([taskId, timer]) => {
                        const elapsed = getLiveElapsedSeconds(taskId);
                        return (
                          <div 
                            key={taskId} 
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between', 
                              padding: '10px 12px', 
                              borderBottom: '1px solid #F3F4F6' 
                            }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1, marginRight: '12px' }}>
                              <span 
                                style={{ 
                                  fontSize: '0.75rem', 
                                  fontWeight: 600, 
                                  color: '#374151', 
                                  whiteSpace: 'nowrap', 
                                  overflow: 'hidden', 
                                  textOverflow: 'ellipsis' 
                                }}
                                title={timer.taskTitle}
                              >
                                {timer.taskTitle}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: '#6B7280', fontFamily: 'monospace', marginTop: '2px' }}>
                                {formatTime(elapsed)}
                              </span>
                            </div>
                            <button 
                              onClick={async (e) => {
                                e.stopPropagation();
                                await stopTimer(taskId);
                              }}
                              style={{
                                backgroundColor: '#FEE2E2',
                                border: 'none',
                                color: '#DC2626',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'background-color 0.15s ease'
                              }}
                              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FCA5A5'}
                              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                            >
                              Stop
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            <Link to="/tasks?new=true" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              fontWeight: 500,
              cursor: 'pointer',
              textDecoration: 'none',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <Plus size={14} /> New Task
            </Link>

            <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--color-border)', margin: '0 8px' }}></div>

            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Bell size={20} color="var(--color-text-secondary)" />
              <div style={{ position: 'absolute', top: '0', right: '0', width: '8px', height: '8px', backgroundColor: 'var(--color-error)', borderRadius: '50%', border: '2px solid var(--color-surface)' }}></div>
            </div>
            
            {/* User Account Dropdown */}
            <div style={{ position: 'relative' }} ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '20px',
                  backgroundColor: '#F3F4F6',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#4F46E5',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.75rem'
                }}>
                  U
                </div>
                <ChevronDown size={14} color="var(--color-text-secondary)" />
              </button>
              
              {showProfileMenu && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: '8px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  minWidth: '160px',
                  zIndex: 100,
                  overflow: 'hidden'
                }}>
                  <Link 
                    to="/settings" 
                    onClick={() => setShowProfileMenu(false)}
                    style={{
                      display: 'block',
                      padding: '10px 16px',
                      fontSize: '0.875rem',
                      color: '#374151',
                      textDecoration: 'none',
                      transition: 'background-color 0.15s ease',
                      borderBottom: '1px solid #F3F4F6'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    Settings
                  </Link>
                  <button 
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      border: 'none',
                      background: 'none',
                      padding: '10px 16px',
                      fontSize: '0.875rem',
                      color: '#EF4444',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--spacing-8)' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};
