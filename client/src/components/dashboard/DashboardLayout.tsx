// import { useState, useEffect } from 'react';
// import { useLocation } from 'wouter';
// import Sidebar from './Sidebar';
// import { Button } from '@/components/ui/button';
// import { useAuth } from '@/lib/auth';
// import { Menu } from 'lucide-react';

// interface DashboardLayoutProps {
//   children: React.ReactNode;
// }

// const DashboardLayout = ({ children }: DashboardLayoutProps) => {
//   const [, navigate] = useLocation();
//   const { user, isAuthenticated } = useAuth();
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   // Redirect to login if not authenticated
//   useEffect(() => {
//     if (!isAuthenticated) {
//       navigate('/');
//     }
//   }, [isAuthenticated, navigate]);

//   if (!isAuthenticated) {
//     return null; // Don't render anything while redirecting
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
//       {/* Mobile Menu Button */}
//       <div className="md:hidden bg-white p-4 flex items-center justify-between shadow-sm">
//         <div className="flex items-center">
//           <span className="font-bold text-xl text-primary">DocFinder</span>
//         </div>
//         <Button 
//           variant="ghost" 
//           size="icon" 
//           onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//         >
//           <Menu className="h-6 w-6" />
//         </Button>
//       </div>

//       {/* Sidebar */}
//       <Sidebar 
//         isMobileMenuOpen={isMobileMenuOpen} 
//         closeMobileMenu={() => setIsMobileMenuOpen(false)} 
//       />

//       {/* Main Content */}
//       <main className="flex-1 p-5 md:p-8 overflow-y-auto">
//         {children}
//       </main>
//     </div>
//   );
// };

// export default DashboardLayout;

import React from 'react';
import { Link, useLocation } from 'wouter'; // Import Link
import {
  LayoutDashboardIcon,
  FileTextIcon,
  SearchIcon,
  BellIcon,
  SettingsIcon,
  LogOutIcon,
  UserIcon,
  Menu, // For mobile toggle
  X // For mobile toggle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { useState } from 'react'; // For mobile menu state

// Sidebar Navigation Items
const sidebarNavItems = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboardIcon },
  { title: 'Report Lost', href: '/report-lost', icon: FileTextIcon },
  { title: 'Report Found', href: '/report-found', icon: FileTextIcon }, // Consider different icon?
  { title: 'Search Documents', href: '/search', icon: SearchIcon },
  { title: 'Notifications', href: '/notifications', icon: BellIcon },
  { title: 'Profile', href: '/profile', icon: SettingsIcon },
];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    // No need to navigate here, AuthProvider handles redirect on logout
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-20 w-64 bg-white shadow-md transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          {/* --- Wrap this logo area with Link --- */}
          <Link href="/" className="flex items-center text-gray-900 hover:text-primary transition-colors duration-150 no-underline">
            <FileTextIcon className="h-6 w-6 text-primary mr-2" />
            <span className="font-heading font-bold text-xl">DocFinder</span>
          </Link>
          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {sidebarNavItems.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                'flex items-center px-4 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 no-underline',
                location === item.href
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
              onClick={() => setIsMobileMenuOpen(false)} // Close menu on navigation
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.title}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 w-full p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-600 hover:bg-red-50 hover:text-red-600"
            onClick={handleLogout}
          >
            <LogOutIcon className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8"> {/* Use max-w-full for header */}
            <div className="flex justify-between h-16">
              {/* Left side - Mobile Menu Toggle & Optional Header Logo */}
              <div className="flex items-center">
                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden mr-2" // Only show on mobile
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>

                {/* Optional: If you also have a logo in the header, wrap it too */}
                {/*
                <Link href="/" className="hidden md:flex items-center text-gray-900 hover:text-primary transition-colors duration-150 no-underline">
                  <FileTextIcon className="h-6 w-6 text-primary mr-2" />
                  <span className="font-heading font-bold text-xl">DocFinder</span>
                </Link>
                */}
              </div>

              {/* Right side - User menu */}
              <div className="flex items-center">
                 {/* ... existing user dropdown code ... */}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default DashboardLayout;
