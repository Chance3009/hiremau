
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Filter, List, Grid, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EventContextBarProps {
  activeEventId: string | null;
  setActiveEventId: (id: string | null) => void;
  activePositionId: string | null;
  setActivePositionId: (id: string | null) => void;
  viewMode?: 'list' | 'card';
  setViewMode?: (mode: 'list' | 'card') => void;
}

const EventContextBar: React.FC<EventContextBarProps> = ({
  activeEventId,
  setActiveEventId,
  activePositionId,
  setActivePositionId,
  viewMode = 'list',
  setViewMode = () => {}
}) => {
  const navigate = useNavigate();
  
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

  // Handler for QR code generation
  const handleGenerateQR = () => {
    navigate('/candidate-intake/qr-registration');
  };
  
  return (
    <div className="bg-muted/30 border-b sticky top-0 z-10">
      <div className="px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Event:</span>
          <Select onValueChange={(value) => setActiveEventId(value === "all" ? null : value)} value={activeEventId || "all"}>
            <SelectTrigger className="w-[180px] h-8">
              <SelectValue placeholder="All Events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Position:</span>
          <Select onValueChange={(value) => setActivePositionId(value === "all" ? null : value)} value={activePositionId || "all"}>
            <SelectTrigger className="w-[180px] h-8">
              <SelectValue placeholder="All Positions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              {positions.map((position) => (
                <SelectItem key={position.id} value={position.id}>{position.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Status:</span>
          <Select defaultValue="all">
            <SelectTrigger className="w-[160px] h-8">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {candidateStatuses.map((status) => (
                <SelectItem key={status.id} value={status.id}>{status.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8" onClick={handleGenerateQR}>
            <QrCode size={16} className="mr-1" />
            <span>Generate QR</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Filter size={16} />
            <span className="sr-only">More filters</span>
          </Button>
          
          <div className="border-l h-6 mx-2"></div>
          
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'list' | 'card')}>
            <TabsList className="h-8">
              <TabsTrigger value="list" className="px-2">
                <List size={16} />
              </TabsTrigger>
              <TabsTrigger value="card" className="px-2">
                <Grid size={16} />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      <Tabs defaultValue="intake" className="px-4 pb-0">
        <TabsList className="h-9">
          <TabsTrigger value="setup" onClick={() => navigate('/event-setup')}>
            Setup
          </TabsTrigger>
          <TabsTrigger value="intake" onClick={() => navigate('/candidate-intake')}>
            Intake
          </TabsTrigger>
          <TabsTrigger value="interview" onClick={() => navigate('/interview')}>
            Interview
          </TabsTrigger>
          <TabsTrigger value="review" onClick={() => navigate('/final-review')}>
            Review
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default EventContextBar;
