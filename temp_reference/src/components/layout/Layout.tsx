import React from 'react';
import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import Header from "./Header";
import { RecruitmentStageBar } from "./RecruitmentStageBar";
import { cn } from "@/lib/utils";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useRecruitment } from "@/contexts/RecruitmentContext";
import { RECRUITMENT_PATHS } from "@/config/constants";

const Layout = () => {
  const location = useLocation();
  const { currentStage } = useRecruitment();

  const isRecruitmentPipeline = RECRUITMENT_PATHS.some(path =>
    location.pathname.startsWith(path)
  ) || ['/applied', '/screened', '/interviewed', '/final-review', '/shortlisted'].some(path =>
    location.pathname.startsWith(path)
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />

          {/* Context Switcher - always show for recruitment related pages */}
          {isRecruitmentPipeline && (
            <div className="border-b">
              <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Context Switcher content will be handled by the Header component */}
              </div>
            </div>
          )}

          {/* Stage Progress Bar - show only on pipeline pages */}
          {isRecruitmentPipeline && (
            <div className="border-b bg-muted/5">
              <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <RecruitmentStageBar />
              </div>
            </div>
          )}

          <main
            className={cn(
              "flex-1 overflow-auto",
              isRecruitmentPipeline && "bg-muted/10"
            )}
          >
            <div className={cn(
              "container mx-auto py-6",
              "px-4 sm:px-6 lg:px-8",
              "max-w-7xl",
              "space-y-6"
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
