import React, { useEffect, useState } from 'react';
import { Bell, Settings, Search, User, ChevronLeft, History, Globe, Briefcase, ChevronDown } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  const [searchQuery, setSearchQuery] = useState('');

  // Determine which filters to show based on current page
  const shouldShowFilters = () => {
    const filterRelevantPaths = [
      '/applied', '/screened', '/interviewed', '/final-review', '/shortlisted', // Pipeline pages
      '/candidate', '/comparison' // Candidate-related pages
    ];
    return filterRelevantPaths.some(path => location.pathname.startsWith(path));
  };

  const shouldShowEventFilter = () => {
    // Show event filter on all pages except job openings and settings
    return !location.pathname.startsWith('/job-openings') &&
      !location.pathname.startsWith('/settings');
  };

  const shouldShowPositionFilter = () => {
    // Show position filter on recruitment pipeline and candidate pages
    return shouldShowFilters();
  };

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
    'applied': 'Applied Candidates',
    'screened': 'Screened Candidates',
    'interviewed': 'Interview',
    'final-review': 'Final Review',
    'shortlisted': 'Shortlisted',
    'candidate': 'Candidate Profile',
    'comparison': 'Candidate Comparison',
    'settings': 'Settings',
    'profile': 'Profile'
  };

  const getPageName = (path: string) => {
    const segments = path.split('/').filter(Boolean);
    return segments.map(segment => routeLabels[segment] || segment).join(' / ');
  };

  const getCurrentPageName = () => {
    return getPageName(location.pathname);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement global search logic here
    // For now, just log the search query
    console.log('Search query:', query);
  };

  const clearFilters = () => {
    setActiveEventId('');
    setActivePositionId('');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="h-14 px-4 flex items-center gap-4">
        {/* Left side - Navigation */}
        <div className="flex items-center gap-3 shrink-0">
          <SidebarTrigger className="md:hidden" />
          {canNavigateBack && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={navigateBack}
              title="Go back"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}

          {/* Page Title */}
          <div className="hidden md:block">
            <h1 className="text-lg font-semibold">{getCurrentPageName()}</h1>
          </div>
        </div>

        {/* Center - Context-aware filters */}
        <div className="flex items-center gap-3 flex-1">
          {shouldShowFilters() && (
            <>
              {/* Event Filter */}
              {shouldShowEventFilter() && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-8 gap-2 min-w-[160px] justify-start">
                      <Globe className="h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {activeEvent ? activeEvent.name : 'All Events'}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-auto" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[280px]">
                    <DropdownMenuLabel>Filter by Event</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setActiveEventId("")}>
                      <div className="flex flex-col">
                        <span>All Events</span>
                        <span className="text-xs text-muted-foreground">Show candidates from all events</span>
                      </div>
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
              )}

              {/* Position Filter */}
              {shouldShowPositionFilter() && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-8 gap-2 min-w-[140px] justify-start"
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
                  <DropdownMenuContent align="start" className="w-[240px]">
                    <DropdownMenuLabel>Filter by Position</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setActivePositionId("")}>
                      <div className="flex flex-col">
                        <span>All Positions</span>
                        <span className="text-xs text-muted-foreground">Show all job openings</span>
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
              )}

              {/* Clear Filters */}
              {(activeEventId || activePositionId) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear filters
                </Button>
              )}
            </>
          )}

          {/* Active Filter Indicators */}
          <div className="flex items-center gap-2">
            {activeEvent && shouldShowEventFilter() && (
              <Badge variant="secondary" className="text-xs">
                Event: {activeEvent.name}
              </Badge>
            )}
            {activePosition && shouldShowPositionFilter() && (
              <Badge variant="outline" className="text-xs">
                Position: {activePosition.name}
              </Badge>
            )}
          </div>
        </div>

        {/* Right side - Search and actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile search button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 sm:hidden"
            onClick={() => navigate('/search')}
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Desktop search */}
          <div className="hidden sm:block relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground pointer-events-none transform -translate-y-1/2" />
            <Input
              placeholder="Search candidates, jobs, events..."
              className="h-8 w-[240px] pl-9 text-sm bg-muted/30 border-muted-foreground/20"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* Recent pages */}
          {recentPages.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" title="Recent pages">
                  <History className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Recent Pages</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {recentPages.slice(0, 5).map((page, index) => (
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
          )}

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 relative" title="Notifications">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-2 text-sm text-muted-foreground">
                No new notifications
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
