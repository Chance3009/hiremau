import React from 'react';
import { Bell, Settings, Search, User, ChevronLeft, History } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useNavigation } from '@/contexts/NavigationContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { canNavigateBack, navigateBack, recentPages } = useNavigation();

  const routeLabels: Record<string, string> = {
    'dashboard': 'Dashboard',
    'events': 'Events',
    'event-setup': 'Event Setup',
    'event-dashboard': 'Event Dashboard',
    'job-openings': 'Job Openings',
    'candidate-intake': 'Candidate Intake',
    'qr-registration': 'QR Registration',
    'interview': 'Interview',
    'final-review': 'Final Review',
    'candidate': 'Candidate',
    'candidate-comparison': 'Comparison',
    'settings': 'Settings',
    'profile': 'Profile'
  };

  const getPageName = (path: string) => {
    const segments = path.split('/').filter(Boolean);
    return segments.map(segment => routeLabels[segment] || segment).join(' / ');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="h-12 px-3 flex items-center gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <SidebarTrigger className="md:hidden" />
          {canNavigateBack && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={navigateBack}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="hidden sm:block flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search candidates, jobs, or events..."
              className="h-8 pl-8 bg-muted/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 sm:hidden"
            onClick={() => navigate('/search')}
          >
            <Search className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <History className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Recent Pages</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {recentPages.map((page, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={() => navigate(page)}
                  className="cursor-pointer"
                >
                  {getPageName(page)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground relative">
            <Bell size={16} />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <User size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
