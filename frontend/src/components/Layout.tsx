import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTimer } from '../context/TimerContext';
import { 
  LayoutDashboard, CheckSquare, Calendar, Clock, 
  BarChart2, Settings as SettingsIcon,
  Search, Bell, LogOut, ChevronDown, Hexagon,
  PieChart, Activity, TrendingUp, HelpCircle, Briefcase, Plus
} from 'lucide-react';

export const Layout: React.FC = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const { activeTaskId, elapsedSeconds, stopTimer } = useTimer();

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
            <ChevronDown size={14} color="var(--color-sidebar-text)" />
          </div>

          {/* Help & Support */}
          <Link to="/help" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px', color: 'var(--color-sidebar-text)', textDecoration: 'none', fontSize: '0.875rem' }}>
            <HelpCircle size={16} /> Help & Support
          </Link>
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
            
            {activeTaskId && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#FEF2F2', padding: '6px 12px', borderRadius: '8px', border: '1px solid #FECACA' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#DC2626', fontWeight: 600, fontSize: '0.875rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#DC2626', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
                  {formatTime(elapsedSeconds)}
                </div>
                <button 
                  onClick={stopTimer}
                  style={{ backgroundColor: '#DC2626', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Stop
                </button>
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
            
            <button 
              onClick={logout}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '4px' }}
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
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
