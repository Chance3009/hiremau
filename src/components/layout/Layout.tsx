
import React, { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import Header from './Header';
import EventContextBar from './EventContextBar';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [activePositionId, setActivePositionId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const location = useLocation();
  
  // Only show the context bar for recruitment-related pages
  const showContextBar = !['/', '/dashboard'].includes(location.pathname);
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          {showContextBar && (
            <EventContextBar 
              activeEventId={activeEventId}
              setActiveEventId={setActiveEventId}
              activePositionId={activePositionId}
              setActivePositionId={setActivePositionId}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />
          )}
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
