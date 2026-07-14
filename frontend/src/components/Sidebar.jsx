import React, { useState } from 'react';
import {
  ShieldCheck, ShieldAlert, Building2, ClipboardList, RefreshCw,
  UserPlus, Users, Settings, LogOut, Menu, X, ChevronRight, Shield,
  BarChart3, Gauge, PanelLeftClose, PanelLeft, Activity
} from 'lucide-react';

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  admin: 'Administrator',
  thana_user: 'Police Officer'
};

const ROLE_COLORS = {
  super_admin: 'bg-white/15 text-white border-white/20',
  admin: 'bg-white/15 text-white border-white/20',
  thana_user: 'bg-white/15 text-white border-white/20'
};

export default function Sidebar({ activeTab, setActiveTab, userProfile, onCreateUser, onLogout, counts = {} }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const role = userProfile?.role || 'thana_user';

  const menuItems = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['super_admin', 'admin', 'thana_user'], section: 'main' },
    { id: 'threats', label: 'Threat Intel', icon: ShieldAlert, roles: ['super_admin', 'admin', 'thana_user'], section: 'main', count: counts.threats },
    { id: 'properties', label: 'Properties', icon: Building2, roles: ['super_admin', 'admin', 'thana_user'], section: 'main', count: counts.properties },
    { id: 'reports', label: 'Reports', icon: ClipboardList, roles: ['super_admin', 'admin', 'thana_user'], section: 'main', count: counts.reports },
    { id: 'create-user', label: 'Create User', icon: UserPlus, roles: ['super_admin', 'admin'], action: onCreateUser, section: 'admin' },
    { id: 'manage-users', label: 'Manage Users', icon: Users, roles: ['super_admin', 'admin'], section: 'admin' },
    { id: 'settings', label: 'System Settings', icon: Settings, roles: ['super_admin'], section: 'system' },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(role));

  const mainItems = visibleItems.filter(i => i.section === 'main');
  const adminItems = visibleItems.filter(i => i.section === 'admin');
  const systemItems = visibleItems.filter(i => i.section === 'system');

  const handleItemClick = (item) => {
    if (item.action) {
      item.action();
    } else {
      setActiveTab(item.id);
    }
    setMobileOpen(false);
  };

  const sidebarContent = (
    <aside
      className={`
        h-screen flex flex-col
        border-r border-orange-300/30
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[72px]' : 'w-[260px]'}
        relative overflow-hidden
        bg-gradient-to-b from-amber-500 to-orange-600
      `}
    >
      {/* Top highlight glow */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

      {/* Header */}
      <div className={`relative p-4 border-b border-white/15 ${collapsed ? 'px-3' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 shrink-0 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg shadow-orange-800/20 border border-white/15">
            <Shield className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-black text-white tracking-tight leading-tight truncate drop-shadow-sm">SafeStay</h2>
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Officer Console</p>
            </div>
          )}
        </div>

        {/* User Info Card */}
        {!collapsed && (
          <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl p-3 space-y-2 border border-white/15">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-white truncate">
                {userProfile?.thana_name || 'Officer'}
              </span>
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border shrink-0 ${ROLE_COLORS[role]}`}>
                {ROLE_LABELS[role]}
              </span>
            </div>
            <p className="text-[10px] font-semibold text-white/50 truncate">{userProfile?.email || ''}</p>
          </div>
        )}

        {/* Collapsed role badge */}
        {collapsed && (
          <div className="mt-3 flex justify-center">
            <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border bg-white/15 text-white border-white/20">
              {role === 'super_admin' ? 'SA' : role === 'admin' ? 'AD' : 'PO'}
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1 relative">
        {/* Main Navigation Section */}
        {!collapsed && (
          <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest px-3 py-2 mt-1">
            Navigation
          </p>
        )}
        {collapsed && <div className="h-3" />}

        {mainItems.map((item) => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            isActive={activeTab === item.id}
            collapsed={collapsed}
            count={item.count}
            onClick={() => handleItemClick(item)}
          />
        ))}

        {/* Administration Section */}
        {adminItems.length > 0 && (
          <>
            <div className="my-2 border-t border-white/15" />
            {!collapsed && (
              <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest px-3 py-2">
                Administration
              </p>
            )}
            {adminItems.map((item) => (
              <SidebarItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                isActive={activeTab === item.id}
                collapsed={collapsed}
                count={item.count}
                onClick={() => handleItemClick(item)}
              />
            ))}
          </>
        )}

        {/* System Section */}
        {systemItems.length > 0 && (
          <>
            <div className="my-2 border-t border-white/15" />
            {!collapsed && (
              <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest px-3 py-2">
                System
              </p>
            )}
            {systemItems.map((item) => (
              <SidebarItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                isActive={activeTab === item.id}
                collapsed={collapsed}
                count={item.count}
                onClick={() => handleItemClick(item)}
              />
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-white/15 space-y-1 relative">
        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeft className="w-4 h-4 stroke-[2.5] mx-auto" />
          ) : (
            <>
              <PanelLeftClose className="w-4 h-4 stroke-[2.5]" />
              <span className="text-xs font-bold">Collapse</span>
            </>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:bg-white/15 hover:text-white transition-all duration-200 group cursor-pointer ${collapsed ? 'justify-center' : ''}`}
          title="Logout"
        >
          <LogOut className="w-4 h-4 stroke-[2.5]" />
          {!collapsed && <span className="text-xs font-bold">Logout</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-2xl text-white hover:brightness-110 transition-all cursor-pointer border border-amber-400/30"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div className={`
        fixed top-0 left-0 z-40 lg:hidden
        transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {sidebarContent}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block sticky top-0 h-screen shrink-0">
        {sidebarContent}
      </div>
    </>
  );
}

function SidebarItem({ icon: Icon, label, isActive, collapsed, count, onClick }) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group cursor-pointer relative
        ${collapsed ? 'justify-center' : ''}
        ${isActive
          ? 'bg-white/25 text-white border border-white/20 shadow-sm'
          : 'text-white/70 hover:bg-white/10 hover:text-white border border-transparent'
        }
      `}
    >
      {/* Active indicator bar */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-white" />
      )}

      <div className="relative shrink-0">
        <Icon className={`w-4 h-4 stroke-[2.5] transition-colors ${isActive ? 'text-white' : 'text-white/50 group-hover:text-white/80'}`} />
        {collapsed && count !== undefined && count > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white text-[8px] font-black text-orange-600 ring-1 ring-white/10">
            {count}
          </span>
        )}
      </div>
      
      {!collapsed && (
        <>
          <span className="text-xs font-bold flex-1 truncate">{label}</span>
          {count !== undefined && count > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white/20 text-white shrink-0 mr-1">
              {count}
            </span>
          )}
          {isActive && <ChevronRight className="w-3 h-3 text-white/50" />}
        </>
      )}
    </button>
  );
}
