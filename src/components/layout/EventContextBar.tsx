
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, List, Grid } from 'lucide-react';

interface EventContextBarProps {
  activeEventId: string | null;
  setActiveEventId: (id: string | null) => void;
  activePositionId: string | null;
  setActivePositionId: (id: string | null) => void;
}

const EventContextBar: React.FC<EventContextBarProps> = ({
  activeEventId,
  setActiveEventId,
  activePositionId,
  setActivePositionId
}) => {
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
  
  const candidateStatuses = [
    { id: 'new', name: 'New' },
    { id: 'screened', name: 'Screened' },
    { id: 'shortlisted', name: 'Shortlisted' },
    { id: 'interviewed', name: 'Interviewed' },
    { id: 'rejected', name: 'Rejected' }
  ];
  
  return (
    <div className="bg-muted/30 border-b px-4 py-2 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Event:</span>
        <Select onValueChange={(value) => setActiveEventId(value)} value={activeEventId || undefined}>
          <SelectTrigger className="w-[180px] h-8">
            <SelectValue placeholder="All Events" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Events</SelectItem>
            {events.map((event) => (
              <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Position:</span>
        <Select onValueChange={(value) => setActivePositionId(value)} value={activePositionId || undefined}>
          <SelectTrigger className="w-[180px] h-8">
            <SelectValue placeholder="All Positions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Positions</SelectItem>
            {positions.map((position) => (
              <SelectItem key={position.id} value={position.id}>{position.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Status:</span>
        <Select>
          <SelectTrigger className="w-[160px] h-8">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            {candidateStatuses.map((status) => (
              <SelectItem key={status.id} value={status.id}>{status.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Filter size={16} />
          <span className="sr-only">More filters</span>
        </Button>
        <div className="border-l h-6 mx-2"></div>
        <div className="flex bg-muted rounded-md">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-r-none">
            <List size={16} />
            <span className="sr-only">List view</span>
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-l-none">
            <Grid size={16} />
            <span className="sr-only">Card view</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventContextBar;
