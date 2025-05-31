import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/lib/auth';
import { 
  HomeIcon, 
  SearchIcon, 
  FileUpIcon,
  HandIcon, 
  BellIcon, 
  UserIcon, 
  Settings2Icon,
  LogOutIcon, 
  FileTextIcon
} from 'lucide-react';

interface SidebarProps {
  isMobileMenuOpen: boolean;
  closeMobileMenu: () => void;
}

const Sidebar = ({ isMobileMenuOpen, closeMobileMenu }: SidebarProps) => {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const getInitials = () => {
    if (!user) return 'U';
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    return user.username?.[0] || 'U';
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <HomeIcon className="h-5 w-5" />,
    },
    {
      name: 'Search',
      path: '/search',
      icon: <SearchIcon className="h-5 w-5" />,
    },
    {
      name: 'Report Lost',
      path: '/report-lost',
      icon: <FileUpIcon className="h-5 w-5" />,
    },
    {
      name: 'Report Found',
      path: '/report-found',
      icon: <HandIcon className="h-5 w-5" />,
    },
    {
      name: 'Notifications',
      path: '/notifications',
      icon: <BellIcon className="h-5 w-5" />,
      badge: 3,
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: <UserIcon className="h-5 w-5" />,
    },
  ];

  return (
    <>
      {/* Mobile Sidebar - Overlay when sidebar is open */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed md:sticky top-0 left-0 h-screen z-50 
          w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b">
          <FileTextIcon className="h-6 w-6 text-primary" />
          <span className="ml-2 font-bold text-lg">DocFinder</span>
        </div>

        {/* Navigation */}
        <ScrollArea className="h-[calc(100vh-4rem-4rem)] py-4">
          <nav className="px-2 space-y-1">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                onClick={closeMobileMenu}
              >
                <Button
                  variant="ghost"
                  className={`
                    w-full justify-start h-10 px-3 font-normal
                    ${location === item.path 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                  {item.badge && (
                    <span className="ml-auto flex items-center justify-center bg-primary text-white text-xs font-medium rounded-full h-5 w-5">
                      {item.badge}
                    </span>
                  )}
                </Button>
              </Link>
            ))}
          </nav>
        </ScrollArea>

        {/* User Profile */}
        <div className="absolute bottom-0 w-full border-t p-4">
          <div className="flex items-center">
            <Avatar>
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-white">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username}
              </p>
              <Link href="/">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-0 h-auto text-xs text-gray-500 hover:text-primary"
                  onClick={() => {
                    logout();
                    closeMobileMenu();
                  }}
                >
                  <LogOutIcon className="h-3 w-3 mr-1" />
                  Sign out
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
