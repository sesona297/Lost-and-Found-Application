import { NavLink, useNavigate } from 'react-router-dom';
import { ReactNode, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard, Search, PackagePlus, Package, FileText, User as UserIcon,
  LogOut, Menu, X, ClipboardCheck, Shield, Users, History, GraduationCap,
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

const studentNav: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { to: '/find-items', label: 'Find Items', icon: <Search className="h-5 w-5" /> },
  { to: '/report-lost', label: 'Report Lost', icon: <PackagePlus className="h-5 w-5" /> },
  { to: '/report-found', label: 'Report Found', icon: <Package className="h-5 w-5" /> },
  { to: '/my-reports', label: 'My Reports', icon: <FileText className="h-5 w-5" /> },
  { to: '/my-claims', label: 'My Claims', icon: <ClipboardCheck className="h-5 w-5" /> },
  { to: '/profile', label: 'Profile', icon: <UserIcon className="h-5 w-5" /> },
];

const adminNav: NavItem[] = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { to: '/admin/items', label: 'All Items', icon: <Package className="h-5 w-5" /> },
  { to: '/admin/claims', label: 'Claims', icon: <ClipboardCheck className="h-5 w-5" /> },
  { to: '/admin/users', label: 'Users', icon: <Users className="h-5 w-5" /> },
  { to: '/admin/actions', label: 'Admin Actions', icon: <History className="h-5 w-5" /> },
];

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = isAdmin ? adminNav : studentNav;

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const sidebarContent = (
    <>
      <div className="flex items-center gap-2.5 px-5 py-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="p-2 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight">Uni Lost & Found</p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {isAdmin ? 'Staff Portal' : 'Student Portal'}
          </p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? '' : 'hover:bg-black/[0.04]'
              }`
            }
            style={({ isActive }) =>
              isActive
                ? { backgroundColor: 'var(--color-primary)', color: 'white' }
                : { color: 'var(--color-text)' }
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t px-3 py-3" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium" style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-primary)' }}>
            {user?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{user?.full_name || 'User'}</p>
            <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
              {isAdmin ? `Staff #${user?.staff_number || ''}` : user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full hover:bg-black/[0.04]"
          style={{ color: 'var(--color-error)' }}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 border-r" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex flex-col w-64 border-r animate-slide-up" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <button
              className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-black/5"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-black/5"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
            <span className="text-sm font-bold">Uni Lost & Found</span>
          </div>
          {isAdmin && <Shield className="h-5 w-5" style={{ color: 'var(--color-secondary)' }} />}
        </div>

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
