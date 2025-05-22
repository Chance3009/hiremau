
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Filter, List, Grid } from 'lucide-react';

interface ContextFilterProps {
  events?: { id: string; name: string }[];
  positions?: { id: string; name: string }[];
  statuses?: { id: string; name: string }[];
  activeEvent?: string | null;
  setActiveEvent?: (id: string | null) => void;
  activePosition?: string | null;
  setActivePosition?: (id: string | null) => void;
  activeStatus?: string | null;
  setActiveStatus?: (id: string | null) => void;
  viewMode?: 'list' | 'card';
  setViewMode?: (mode: 'list' | 'card') => void;
  showViewToggle?: boolean;
  showFilters?: boolean;
}

const ContextFilter: React.FC<ContextFilterProps> = ({
  events = [],
  positions = [],
  statuses = [],
  activeEvent = null,
  setActiveEvent = () => {},
  activePosition = null,
  setActivePosition = () => {},
  activeStatus = null,
  setActiveStatus = () => {},
  viewMode = 'list',
  setViewMode = () => {},
  showViewToggle = true,
  showFilters = true,
}) => {
  return (
    <div className="bg-muted/20 border-b mb-6 pb-4">
      <div className="px-2 py-3 flex flex-wrap items-center gap-3">
        {showFilters && (
          <>
            {events.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Event:</span>
                <Select onValueChange={(value) => setActiveEvent(value === "all" ? null : value)} value={activeEvent || "all"}>
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
            )}
            
            {positions.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Position:</span>
                <Select onValueChange={(value) => setActivePosition(value === "all" ? null : value)} value={activePosition || "all"}>
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
            )}
            
            {statuses.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <Select 
                  onValueChange={(value) => setActiveStatus(value === "all" ? null : value)} 
                  value={activeStatus || "all"}
                >
                  <SelectTrigger className="w-[160px] h-8">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statuses.map((status) => (
                      <SelectItem key={status.id} value={status.id}>{status.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </>
        )}
        
        <div className="ml-auto flex items-center gap-2">
          {showFilters && (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Filter size={16} />
              <span className="sr-only">More filters</span>
            </Button>
          )}
          
          {showViewToggle && (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContextFilter;
