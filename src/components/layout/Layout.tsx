import React from 'react';
import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import Header from "./Header";
import EventContextBar from "./EventContextBar";
import { cn } from "@/lib/utils";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useRecruitment } from "@/contexts/RecruitmentContext";

const RECRUITMENT_STAGES = ['applied', 'screened', 'interviewed', 'final-review', 'hired'];

const Layout = () => {
  const location = useLocation();
  const {
    activeEventId,
    setActiveEventId,
    activePositionId,
    setActivePositionId,
    currentStage
  } = useRecruitment();

  const isRecruitmentPipeline = RECRUITMENT_STAGES.some(stage =>
    location.pathname.startsWith(`/${stage}`)
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          {isRecruitmentPipeline && (
            <EventContextBar
              activeEventId={activeEventId}
              setActiveEventId={setActiveEventId}
              activePositionId={activePositionId}
              setActivePositionId={setActivePositionId}
            />
          )}
          <main
            className={cn(
              "flex-1 overflow-auto",
              isRecruitmentPipeline && "bg-muted/30"
            )}
          >
            <div className={cn(
              "container mx-auto py-6",
              "px-4 sm:px-6 lg:px-8",
              "max-w-7xl min-w-0",
              "space-y-6",
              isRecruitmentPipeline && "bg-background rounded-lg shadow-sm mt-6"
            )}>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
