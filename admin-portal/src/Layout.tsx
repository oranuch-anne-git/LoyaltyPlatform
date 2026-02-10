import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './auth';
import './Layout.css';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">◆</span>
          <span>Loyalty Admin</span>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            Dashboard
          </NavLink>
          <NavLink to="/members" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            Members
          </NavLink>
          <NavLink to="/member-levels" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            Member Levels
          </NavLink>
          <NavLink to="/rewards" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            Rewards
          </NavLink>
          <NavLink to="/campaigns" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            Campaigns
          </NavLink>
          <NavLink to="/audit" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            Audit Logs
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <span className="user-email">{user?.email}</span>
            <span className="user-role">{user?.role}</span>
          </div>
          <button type="button" className="btn btn-ghost" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
