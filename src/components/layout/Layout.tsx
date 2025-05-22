
import React, { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import Header from './Header';
import EventContextBar from './EventContextBar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [activePositionId, setActivePositionId] = useState<string | null>(null);
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <EventContextBar 
            activeEventId={activeEventId}
            setActiveEventId={setActiveEventId}
            activePositionId={activePositionId}
            setActivePositionId={setActivePositionId}
          />
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
