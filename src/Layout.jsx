import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import {
  Library, BookOpen, Users, BarChart3, Settings,
  Menu, Home, BookMarked, Clock, Search,
  Radio, FileText
} from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function Layout({ children, currentPageName }) {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ✅ All pages visible (no roles)
  const navItems = [
    { name: 'Home', page: 'Home', icon: Home },
    { name: 'Dashboard', page: 'AdminDashboard', icon: BarChart3 },
    { name: 'Books', page: 'BookManagement', icon: BookOpen },
    { name: 'Browse Books', page: 'BrowseBooks', icon: Search },
    { name: 'My Books', page: 'MyBooks', icon: BookMarked },
    { name: 'Users', page: 'UserManagement', icon: Users },
    { name: 'Transactions', page: 'TransactionManagement', icon: Clock },
    { name: 'Requests', page: 'BookRequests', icon: BookMarked },
    { name: 'RFID Scanner', page: 'RFIDScanner', icon: Radio },
    { name: 'Reports', page: 'Reports', icon: FileText },
    { name: 'Settings', page: 'LibrarySettings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r 
        ${sidebarOpen ? 'block' : 'hidden'} lg:block`}>

        <div className="p-4 font-bold flex items-center gap-2">
          <Library /> Smart Library
        </div>

        <nav className="p-2 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className="flex gap-2 p-2 hover:bg-gray-100 rounded"
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="lg:ml-64">

        {/* Header */}
        <header className="h-14 bg-white border-b flex items-center px-4 justify-between">
          <Button onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu />
          </Button>

          <h2>{currentPageName}</h2>
        </header>

        {/* Content */}
        <main className="p-4">
          {children}
        </main>

      </div>
    </div>
  );
}