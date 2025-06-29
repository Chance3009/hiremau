import React, { useEffect, useState } from 'react';
import { Bell, Settings, Search, User, ChevronLeft, History, Globe, Briefcase, ChevronDown } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useNavigation } from '@/contexts/NavigationContext';
import { useRecruitment } from '@/contexts/RecruitmentContext';
import { fetchJobs } from '@/services/jobService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data for events (replace with your actual data source)
const events = [
  { id: '1', name: 'UPM Career Fair 2025' },
  { id: '2', name: 'Tech Recruit Summit' },
  { id: '3', name: 'Engineering Talent Day' }
];

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { canNavigateBack, navigateBack, recentPages } = useNavigation();
  const { activeEventId, setActiveEventId, activePositionId, setActivePositionId } = useRecruitment();

  // State for real positions from jobs
  const [positions, setPositions] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingPositions, setLoadingPositions] = useState(true);

  // Fetch real jobs/positions
  useEffect(() => {
    const loadPositions = async () => {
      try {
        const jobs = await fetchJobs();
        const jobPositions = jobs.map((job: any) => ({
          id: job.id,
          name: job.title
        }));
        setPositions(jobPositions);
      } catch (error) {
        console.error('Failed to load positions:', error);
        // Fallback to mock data
        setPositions([
          { id: '1', name: 'Frontend Developer' },
          { id: '2', name: 'UX Designer' },
          { id: '3', name: 'Backend Developer' },
          { id: '4', name: 'Product Manager' },
        ]);
      } finally {
        setLoadingPositions(false);
      }
    };

    loadPositions();
  }, []);

  const activeEvent = events.find(e => e.id === activeEventId);
  const activePosition = positions.find(p => p.id === activePositionId);

  const routeLabels: Record<string, string> = {
    'dashboard': 'Dashboard',
    'events': 'Events',
    'event-setup': 'Event Setup',
    'event-dashboard': 'Event Dashboard',
    'job-openings': 'Job Openings',
    'candidate-intake': 'Candidate Intake',
    'qr-registration': 'QR Registration',
    'interviewed': 'Interview',
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

        {/* Event and Position Dropdowns */}
        <div className="hidden md:flex items-center gap-3 flex-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8 gap-2 min-w-[200px] justify-start">
                <Globe className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {activeEvent ? activeEvent.name : 'All Events'}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-auto" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[300px]">
              <DropdownMenuLabel>Select Event</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setActiveEventId("")}>
                All Events
              </DropdownMenuItem>
              {events.map((event) => (
                <DropdownMenuItem
                  key={event.id}
                  onClick={() => setActiveEventId(event.id)}
                >
                  {event.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-8 gap-2 min-w-[180px] justify-start"
                disabled={loadingPositions}
              >
                <Briefcase className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {loadingPositions
                    ? 'Loading...'
                    : activePosition
                      ? activePosition.name
                      : 'All Positions'
                  }
                </span>
                <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-auto" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[250px]">
              <DropdownMenuLabel>Filter by Position</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setActivePositionId("")}>
                <div className="flex flex-col">
                  <span>All Positions</span>
                  <span className="text-xs text-muted-foreground">Show candidates from all job openings</span>
                </div>
              </DropdownMenuItem>
              {positions.map((position) => (
                <DropdownMenuItem
                  key={position.id}
                  onClick={() => setActivePositionId(position.id)}
                >
                  {position.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Context Labels */}
          <div className="flex items-center gap-2 ml-2">
            {activeEvent && (
              <div className="bg-muted/50 text-muted-foreground px-2 py-1 rounded text-xs flex items-center gap-1">
                <span className="text-foreground">Event:</span>
                {activeEvent.name}
              </div>
            )}
            {activePosition && (
              <div className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs flex items-center gap-1">
                <span className="text-blue-700">Position:</span>
                {activePosition.name}
              </div>
            )}
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 sm:hidden"
            onClick={() => navigate('/search')}
          >
            <Search className="h-4 w-4" />
          </Button>

          <div className="hidden sm:block relative max-w-[200px]">
            <Search className="absolute left-2 top-1.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search..."
              className="h-7 pl-8 text-sm bg-muted/50"
            />
          </div>

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
        </div>
      </div>
    </header>
  );
};

export default Header;
