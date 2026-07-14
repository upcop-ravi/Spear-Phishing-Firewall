import React, { useState } from 'react';
import {
  ShieldCheck, ShieldAlert, Building2, ClipboardList, RefreshCw,
  UserPlus, Users, Settings, LogOut, Menu, X, ChevronRight, Shield
} from 'lucide-react';

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  admin: 'Administrator',
  thana_user: 'Police Officer'
};

const ROLE_COLORS = {
  super_admin: 'bg-red-100 text-red-700 border-red-200',
  admin: 'bg-amber-100 text-amber-700 border-amber-200',
  thana_user: 'bg-indigo-100 text-indigo-700 border-indigo-200'
};

export default function Sidebar({ activeTab, setActiveTab, userProfile, onCreateUser, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const role = userProfile?.role || 'thana_user';
  const isAdmin = role === 'super_admin' || role === 'admin';

  const menuItems = [
    { id: 'analytics', label: 'Analytics', icon: RefreshCw, roles: ['super_admin', 'admin', 'thana_user'] },
    { id: 'threats', label: 'Threat Intel', icon: ShieldAlert, roles: ['super_admin', 'admin', 'thana_user'] },
    { id: 'properties', label: 'Properties', icon: Building2, roles: ['super_admin', 'admin', 'thana_user'] },
    { id: 'reports', label: 'Reports', icon: ClipboardList, roles: ['super_admin', 'admin', 'thana_user'] },
    { id: 'create-user', label: 'Create User', icon: UserPlus, roles: ['super_admin', 'admin'], action: onCreateUser },
    { id: 'manage-users', label: 'Manage Users', icon: Users, roles: ['super_admin', 'admin'] },
    { id: 'settings', label: 'System Settings', icon: Settings, roles: ['super_admin'] },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-white border border-slate-200 rounded-xl shadow-lg text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
      >
        {collapsed ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay for mobile */}
      {collapsed && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setCollapsed(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen z-40
        w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200
        flex flex-col transition-transform duration-300 ease-in-out
        ${collapsed ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Shield className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 tracking-tight leading-tight">SafeStay</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Officer Console</p>
            </div>
          </div>

          {/* User info card */}
          <div className="bg-slate-50 rounded-xl p-3 space-y-2 border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 truncate max-w-[140px]">
                {userProfile?.thana_name || 'Officer'}
              </span>
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${ROLE_COLORS[role]}`}>
                {ROLE_LABELS[role]}
              </span>
            </div>
            <p className="text-[10px] font-semibold text-slate-400 truncate">{userProfile?.email || ''}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2">Navigation</p>
          
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            // Separator before admin section
            if (item.id === 'create-user') {
              return (
                <React.Fragment key={item.id}>
                  <div className="my-2 border-t border-slate-100" />
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2">Administration</p>
                  <SidebarItem
                    icon={Icon}
                    label={item.label}
                    isActive={isActive}
                    onClick={() => {
                      if (item.action) {
                        item.action();
                      } else {
                        setActiveTab(item.id);
                      }
                      setCollapsed(false);
                    }}
                  />
                </React.Fragment>
              );
            }

            if (item.id === 'settings') {
              return (
                <React.Fragment key={item.id}>
                  <div className="my-2 border-t border-slate-100" />
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2">System</p>
                  <SidebarItem
                    icon={Icon}
                    label={item.label}
                    isActive={isActive}
                    onClick={() => {
                      setActiveTab(item.id);
                      setCollapsed(false);
                    }}
                  />
                </React.Fragment>
              );
            }

            return (
              <SidebarItem
                key={item.id}
                icon={Icon}
                label={item.label}
                isActive={isActive}
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else {
                    setActiveTab(item.id);
                  }
                  setCollapsed(false);
                }}
              />
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 group cursor-pointer"
          >
            <LogOut className="w-4 h-4 stroke-[2.5]" />
            <span className="text-xs font-bold">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function SidebarItem({ icon: Icon, label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all duration-200 group cursor-pointer
        ${isActive
          ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
        }
      `}
    >
      <Icon className={`w-4 h-4 stroke-[2.5] transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
      <span className="text-xs font-bold flex-1">{label}</span>
      {isActive && <ChevronRight className="w-3 h-3 text-indigo-400" />}
    </button>
  );
}
