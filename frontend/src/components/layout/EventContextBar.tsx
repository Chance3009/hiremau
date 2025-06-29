import React from 'react';
import { useNavigate } from 'react-router-dom';
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
import { ChevronDown, Building2, CalendarDays, Globe } from 'lucide-react';
import { RecruitmentProgressBar } from './RecruitmentProgressBar';
import { useRecruitment } from '@/contexts/RecruitmentContext';

interface EventContextBarProps {
  activeEventId?: string;
  setActiveEventId?: (id: string) => void;
  activePositionId?: string;
  setActivePositionId?: (id: string) => void;
}

const EventContextBar: React.FC<EventContextBarProps> = ({
  activeEventId,
  setActiveEventId = () => { },
  activePositionId,
  setActivePositionId = () => { },
}) => {
  const { currentStage } = useRecruitment();

  // Mock data for events and positions
  const events = [
    { id: '1', name: 'UPM Career Fair 2025' },
    { id: '2', name: 'Tech Recruit Summit' },
    { id: '3', name: 'Engineering Talent Day' }
  ];

  const positions = [
    { id: '1', name: 'Frontend Developer' },
    { id: '2', name: 'UX Designer' },
    { id: '3', name: 'Backend Developer' },
    { id: '4', name: 'Product Manager' },
  ];

  const activeEvent = events.find(e => e.id === activeEventId);
  const activePosition = positions.find(p => p.id === activePositionId);

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-col sm:flex-row gap-2 p-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* GCP-style Event Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9 gap-2 min-w-[160px] md:min-w-[200px] max-w-full">
                <Globe className="h-4 w-4 shrink-0" />
                <span className="truncate">{activeEvent?.name || 'All Events'}</span>
                <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-auto" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[300px]">
              <DropdownMenuLabel>Select Event Context</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2"
                onClick={() => setActiveEventId('')}
              >
                <Globe className="h-4 w-4 shrink-0" />
                <span>All Events</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {events.map((event) => (
                  <DropdownMenuItem
                    key={event.id}
                    className="gap-2"
                    onClick={() => setActiveEventId(event.id)}
                  >
                    <CalendarDays className="h-4 w-4 shrink-0" />
                    <span className="truncate">{event.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Position Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9 gap-2 min-w-[160px] md:min-w-[200px] max-w-full">
                <Building2 className="h-4 w-4 shrink-0" />
                <span className="truncate">{activePosition?.name || 'Select Position'}</span>
                <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-auto" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[300px]">
              <DropdownMenuLabel>Select Position</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {positions.map((position) => (
                  <DropdownMenuItem
                    key={position.id}
                    className="gap-2"
                    onClick={() => setActivePositionId(position.id)}
                  >
                    <Building2 className="h-4 w-4 shrink-0" />
                    <span className="truncate">{position.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Additional Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="secondary" size="sm" className="h-9">
            Export
          </Button>
          <Button size="sm" className="h-9">
            Add Candidate
          </Button>
        </div>
      </div>

      {/* Recruitment Progress Bar */}
      <RecruitmentProgressBar />
    </div>
  );
};

export default EventContextBar;
