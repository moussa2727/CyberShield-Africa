'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  MessageSquare,
  User,
  LogOut,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const sidebarItems: SidebarItem[] = [
  {
    label: 'Profil',
    href: '/admin/profile',
    icon: User,
  },
  {
    label: 'Messages',
    href: '/admin/messages',
    icon: MessageSquare,
  },
];

interface AdminSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export default function AdminSidebar({ isCollapsed = false, onToggle }: AdminSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div
      className={`flex flex-col h-full bg-linear-to-b from-gray-900 to-gray-800 border-r border-gray-700 transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-56 opacity-100'}`}
    >
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="w-9 h-9 bg-linear-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shrink-0"
            >
              <Settings className="text-white" size={25} />
            </Link>
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold text-white">Admin</h1>
              <p className="text-xs text-gray-400">Panneau</p>
            </div>
          </div>
          {/* Toggle Button - Desktop only */}
          <button
            onClick={onToggle}
            className="hidden lg:flex p-1.5 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
            title="Réduire"
          >
            <ChevronLeft size={16} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-2 py-2 rounded-md transition-all duration-200 ${
                active
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Icon size={18} className={active ? 'text-white' : 'text-gray-400'} />
              <span className={`font-medium text-xs ${active ? 'text-white' : 'text-gray-300'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-2 border-t border-gray-700">
        {!isCollapsed && (
          <div className="mb-2 p-2 bg-gray-700/50 rounded-md">
            <p className="text-xs font-medium text-white truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <div className="mt-1">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-600/20 text-orange-400 border border-orange-600/30">
                {user?.role}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-2 py-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-md transition-all duration-200"
        >
          <LogOut size={18} />
          <span className="font-medium text-xs">Déconnexion</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`
        lg:hidden fixed inset-y-0 left-0 z-50 w-56 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        <div className="w-56 h-full">
          <SidebarContent />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 transition-all duration-300 ${isCollapsed ? 'lg:w-0' : 'lg:w-56'}`}
      >
        <SidebarContent />
      </div>

      {/* Toggle Button (when sidebar is collapsed) - Desktop only */}
      {isCollapsed && (
        <button
          onClick={onToggle}
          className="hidden lg:flex lg:fixed lg:left-0 lg:top-4 lg:z-40 p-2 bg-gray-800 text-white rounded-r-lg shadow-md hover:bg-gray-700 transition-all duration-300 items-center justify-center"
          title="Développer le menu"
        >
          <ChevronRight size={20} />
        </button>
      )}
    </>
  );
}
