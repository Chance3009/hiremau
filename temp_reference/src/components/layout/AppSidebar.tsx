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
  GitCompare,
  LogOut,
  User
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRecruitment } from "@/contexts/RecruitmentContext";

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
    label: "Recruitment",
    items: [
      {
        title: "Recruitment Pipeline",
        path: "/applied",
        icon: <Users size={18} />
      },
      {
        title: "Interview Lobby",
        path: "/interview",
        icon: <MessageSquare size={18} />
      }
    ]
  },
  {
    label: "Administration",
    items: [
      {
        title: "Admin & Config",
        path: "/settings",
        icon: <Settings size={18} />
      }
    ]
  }
];

// Mock user data - would come from auth context
const currentUser = {
  name: "John Doe",
  email: "john.doe@hiremau.com",
  role: "HR Manager",
  avatar: null,
  initials: "JD"
};

export function AppSidebar() {
  const location = useLocation();
  const { state, setOpen } = useSidebar();
  const { setCurrentStage } = useRecruitment();

  const isActive = (path: string) => {
    if (path === "/applied") {
      // Special case for recruitment pipeline - match any pipeline stage
      return ['/applied', '/screened', '/interviewed', '/final-review', '/shortlisted'].some(
        stagePath => location.pathname.startsWith(stagePath)
      );
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    if (path === '/interview') {
      setCurrentStage('interviewed');
    }
    // Close sidebar on mobile after navigation
    if (state === "expanded" && window.innerWidth < 768) {
      setOpen(false);
    }
  };

  const handleLogout = () => {
    // Add logout logic here
    console.log("Logout clicked");
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="shrink-0 border-r">
      <SidebarRail className="shrink-0" />

      {/* Header with Logo */}
      <SidebarHeader className="border-b shrink-0">
        <div className={cn(
          "flex items-center transition-all duration-200 ease-in-out",
          state === "expanded" ? "px-4 py-4 justify-between" : "p-2 justify-center"
        )}>
          <div
            className={cn(
              "flex items-center gap-2 transition-all duration-200 ease-in-out cursor-pointer",
              state === "expanded" ? "w-full" : ""
            )}
            onClick={() => state === "collapsed" && setOpen(true)}
          >
            <div className="h-8 w-8 shrink-0">
              <img
                src="/icon.png"
                alt="HireMau Logo"
                className="w-full h-full object-contain"
              />
            </div>
            {state === "expanded" && (
              <span className="text-lg font-semibold tracking-tight text-primary">
                HireMau
              </span>
            )}
          </div>
          {state === "expanded" && (
            <SidebarTrigger
              className="h-7 w-7 hover:bg-muted/80 transition-colors duration-200 rounded-md flex items-center justify-center text-muted-foreground/60 shrink-0"
            />
          )}
        </div>
      </SidebarHeader>

      {/* Navigation Content */}
      <SidebarContent
        className={cn(
          "px-3 overflow-y-auto flex-1",
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
                        onClick={() => handleNavigation(item.path)}
                        className={cn(
                          "flex items-center rounded-md transition-colors duration-200",
                          state === "expanded"
                            ? "px-2 gap-3 min-w-0"
                            : "h-10 w-10 justify-center",
                          "hover:bg-muted/50",
                          isActive(item.path) && "bg-muted font-medium text-foreground",
                          !isActive(item.path) && "text-muted-foreground"
                        )}
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

      {/* User Info Footer */}
      <SidebarFooter className="border-t shrink-0">
        <div className={cn(
          "transition-all duration-200 ease-in-out",
          state === "expanded" ? "p-4" : "p-2"
        )}>
          {state === "expanded" ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-auto p-2 hover:bg-muted/50"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {currentUser.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start min-w-0">
                    <span className="text-sm font-medium truncate w-full">
                      {currentUser.name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate w-full">
                      {currentUser.email}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground">{currentUser.role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                  tooltip={`${currentUser.name} - ${currentUser.role}`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {currentUser.initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground">{currentUser.role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
