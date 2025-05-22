
import { useLocation } from "react-router-dom";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  UserPlus,
  MessageSquare,
  CheckSquare,
  AlertTriangle,
  Briefcase,
  Users
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  
  const isActive = (path: string) => location.pathname === path;
  
  const getNavClass = ({ isActive }: { isActive: boolean }) => 
    isActive 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

  return (
    <Sidebar variant="sidebar">
      <SidebarRail />
      <SidebarHeader className="flex items-center px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-lg font-semibold text-primary-foreground">
            HR
          </div>
          {state === "expanded" && (
            <div className="flex flex-col">
              <span className="text-sm font-bold">HireFlow</span>
              <span className="text-xs text-sidebar-foreground/70">Recruiter Assistant</span>
            </div>
          )}
        </div>
        <div className="flex-1"></div>
        <SidebarTrigger />
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard">
                  <NavLink to="/dashboard" className={getNavClass}>
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Events">
                  <NavLink to="/event-setup" className={getNavClass}>
                    <Calendar size={20} />
                    <span>Events</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Job Openings">
                  <NavLink to="/job-openings" className={getNavClass}>
                    <Briefcase size={20} />
                    <span>Job Openings</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Recruitment</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Candidates">
                  <NavLink to="/candidate-intake" className={getNavClass}>
                    <UserPlus size={20} />
                    <span>Candidates</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Interviews">
                  <NavLink to="/interview" className={getNavClass}>
                    <MessageSquare size={20} />
                    <span>Interviews</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Final Review">
                  <NavLink to="/final-review" className={getNavClass}>
                    <CheckSquare size={20} />
                    <span>Final Review</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Comparison">
                  <NavLink to="/candidate-comparison" className={getNavClass}>
                    <Users size={20} />
                    <span>Comparison</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="mt-auto border-t border-sidebar-border p-2">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            {state === "expanded" && (
              <span className="text-xs text-sidebar-foreground/70">Demo Version</span>
            )}
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
