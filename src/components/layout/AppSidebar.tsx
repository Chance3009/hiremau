
import { useLocation } from "react-router-dom";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  UserPlus,
  MessageSquare,
  CheckSquare,
  Settings,
  Briefcase,
  Users,
  FileCheck,
  UserCheck,
  GitCompare
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
import { cn } from "@/lib/utils";

interface MenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        path: "/dashboard",
        icon: <LayoutDashboard size={18} />
      },
      {
        title: "Events",
        path: "/events",
        icon: <Calendar size={18} />
      },
      {
        title: "Job Openings",
        path: "/job-openings",
        icon: <Briefcase size={18} />
      }
    ]
  },
  {
    label: "Recruitment Pipeline",
    items: [
      {
        title: "Applications",
        path: "/applied",
        icon: <UserPlus size={18} />
      },
      {
        title: "Screening",
        path: "/screened",
        icon: <FileCheck size={18} />
      },
      {
        title: "Interviews",
        path: "/interviewed",
        icon: <MessageSquare size={18} />
      },
      {
        title: "Final Review",
        path: "/final-review",
        icon: <CheckSquare size={18} />
      },
      {
        title: "Comparison",
        path: "/candidate-comparison",
        icon: <GitCompare size={18} />
      },
      {
        title: "Hired",
        path: "/hired",
        icon: <UserCheck size={18} />
      }
    ]
  },
  {
    label: "Settings",
    items: [
      {
        title: "Admin & Config",
        path: "/settings",
        icon: <Settings size={18} />
      }
    ]
  }
];

export function AppSidebar() {
  const location = useLocation();
  const { state, setOpen } = useSidebar();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="shrink-0 border-r">
      <SidebarRail className="shrink-0" />
      <SidebarHeader className="border-b shrink-0">
        <div className={cn(
          "flex items-center transition-all duration-200 ease-in-out",
          state === "expanded" ? "px-6 py-4 justify-between" : "p-2 justify-center"
        )}>
          <div
            className={cn(
              "transition-all duration-200 ease-in-out cursor-pointer",
              state === "expanded" ? "h-8 w-[120px]" : "h-8 w-8"
            )}
            onClick={() => state === "collapsed" && setOpen(true)}
          >
            <img
              src="/HireMau.png"
              alt="HireMau Logo"
              className={cn(
                "transition-all duration-200",
                state === "expanded"
                  ? "w-full h-full object-contain"
                  : "w-8 h-8 object-cover rounded-md"
              )}
            />
          </div>
          {state === "expanded" && (
            <SidebarTrigger
              className="h-7 w-7 hover:bg-muted/80 transition-colors duration-200 rounded-md flex items-center justify-center text-muted-foreground/60 shrink-0"
              tooltip="Collapse Sidebar"
            />
          )}
        </div>
        {state === "expanded" && (
          <div className="px-6 pb-3">
            <span className="text-sm font-medium text-muted-foreground/80">AI Recruitment Assistant</span>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent
        className={cn(
          "px-3 overflow-y-auto",
          state === "collapsed" && "hover:cursor-pointer group"
        )}
        onClick={() => state === "collapsed" && setOpen(true)}
      >
        {state === "collapsed" && (
          <div className="absolute left-full ml-2 rounded-md px-2 py-1 bg-popover text-popover-foreground border shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-sm z-50">
            Click to expand sidebar
          </div>
        )}
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label} className={cn(
            state === "collapsed" && "!p-0"
          )}>
            <SidebarGroupLabel className={cn(
              "px-2 text-sm text-muted-foreground font-medium",
              state === "collapsed" && "hidden"
            )}>
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent className={cn(
              state === "collapsed" && "!flex !justify-center"
            )}>
              <SidebarMenu className={cn(
                state === "collapsed" && "!items-center"
              )}>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      tooltip={state === "collapsed" ? item.title : undefined}
                    >
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center rounded-md transition-colors duration-200",
                            state === "expanded"
                              ? "px-2 gap-3 min-w-0"
                              : "h-10 w-10 justify-center",
                            "hover:bg-muted/50",
                            isActive && "bg-muted font-medium text-foreground",
                            !isActive && "text-muted-foreground"
                          )
                        }
                      >
                        {item.icon}
                        {state === "expanded" && (
                          <span className="truncate text-sm">{item.title}</span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t shrink-0">
        <div className={cn(
          "flex items-center transition-all duration-200 ease-in-out",
          state === "expanded" ? "px-6 py-4" : "p-2 justify-center"
        )}>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-muted/50" />
            {state === "expanded" && (
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">John Doe</div>
                <div className="truncate text-xs text-muted-foreground">john@example.com</div>
              </div>
            )}
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
