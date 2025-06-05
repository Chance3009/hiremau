
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Building2, CalendarDays, Globe, Briefcase } from 'lucide-react';
import { useRecruitment } from '@/contexts/RecruitmentContext';

export const ContextSwitcher = () => {
  const { activeEventId, setActiveEventId, activePositionId, setActivePositionId } = useRecruitment();

  // Mock data
  const events = [
    { id: '1', name: 'UPM Career Fair 2025', status: 'active' },
    { id: '2', name: 'Tech Recruit Summit', status: 'upcoming' },
    { id: '3', name: 'Engineering Talent Day', status: 'draft' }
  ];

  const positions = [
    { id: '1', name: 'Frontend Developer', eventId: '1' },
    { id: '2', name: 'UX Designer', eventId: '1' },
    { id: '3', name: 'Backend Developer', eventId: '2' },
    { id: '4', name: 'Product Manager', eventId: null }, // Cross-event position
  ];

  const activeEvent = events.find(e => e.id === activeEventId);
  const activePosition = positions.find(p => p.id === activePositionId);

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-muted/20 border-b">
      {/* Event Context Switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-9 gap-2 min-w-[200px] justify-start">
            <Globe className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {activeEvent ? activeEvent.name : 'All Events'}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-auto" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[300px]" align="start">
          <DropdownMenuLabel>Recruitment Context</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2 cursor-pointer"
            onClick={() => setActiveEventId('')}
          >
            <Globe className="h-4 w-4 shrink-0" />
            <div className="flex-1">
              <div className="font-medium">All Events</div>
              <div className="text-xs text-muted-foreground">Global overview</div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {events.map((event) => (
              <DropdownMenuItem
                key={event.id}
                className="gap-2 cursor-pointer"
                onClick={() => setActiveEventId(event.id)}
              >
                <CalendarDays className="h-4 w-4 shrink-0" />
                <div className="flex-1">
                  <div className="font-medium truncate">{event.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{event.status}</div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Position Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-9 gap-2 min-w-[180px] justify-start">
            <Briefcase className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {activePosition ? activePosition.name : 'All Positions'}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-auto" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[250px]" align="start">
          <DropdownMenuLabel>Position Filter</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2 cursor-pointer"
            onClick={() => setActivePositionId('')}
          >
            <Briefcase className="h-4 w-4 shrink-0" />
            <span>All Positions</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {positions
              .filter(pos => !activeEventId || pos.eventId === activeEventId || !pos.eventId)
              .map((position) => (
              <DropdownMenuItem
                key={position.id}
                className="gap-2 cursor-pointer"
                onClick={() => setActivePositionId(position.id)}
              >
                <Briefcase className="h-4 w-4 shrink-0" />
                <span className="truncate">{position.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Context Label */}
      {(activeEvent || activePosition) && (
        <div className="ml-2 text-xs text-muted-foreground">
          {activeEvent && (
            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs mr-2">
              Scoped to: {activeEvent.name}
            </span>
          )}
          {activePosition && (
            <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs">
              Position: {activePosition.name}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
