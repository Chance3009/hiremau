import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { useNavigate } from 'react-router-dom';

const EventSetup = () => {
  const navigate = useNavigate();
  const [eventName, setEventName] = React.useState('');
  const [eventDate, setEventDate] = React.useState('');
  const [eventLocation, setEventLocation] = React.useState('');
  const [positions, setPositions] = React.useState([
    { id: 1, title: '', requirements: '', tags: '' }
  ]);

  const addPosition = () => {
    const newId = positions.length > 0 ? Math.max(...positions.map(p => p.id)) + 1 : 1;
    setPositions([...positions, { id: newId, title: '', requirements: '', tags: '' }]);
  };

  const removePosition = (id: number) => {
    if (positions.length > 1) {
      setPositions(positions.filter(p => p.id !== id));
    }
  };

  const updatePosition = (id: number, field: string, value: string) => {
    setPositions(positions.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Event Created",
      description: `${eventName} has been successfully created with ${positions.length} position(s)`,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Event Setup"
        subtitle="Create and configure recruiting events"
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/events')}>
            Back to Events
          </Button>
        </div>
      </PageHeader>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Information</CardTitle>
              <CardDescription>Set up the basic details for your recruiting event.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="event-name">Event Name</Label>
                  <Input
                    id="event-name"
                    placeholder="e.g. Fall 2025 Career Fair"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="event-date">Event Date</Label>
                    <Input
                      id="event-date"
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="event-location">Location</Label>
                    <Input
                      id="event-location"
                      placeholder="e.g. University Main Campus"
                      value={eventLocation}
                      onChange={(e) => setEventLocation(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Job Positions</CardTitle>
                <CardDescription>Add the positions you're hiring for at this event.</CardDescription>
              </div>
              <Button type="button" onClick={addPosition} size="sm" variant="outline" className="flex items-center gap-1">
                <Plus size={16} />
                <span>Add Position</span>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {positions.map((position) => (
                  <div key={position.id} className="grid gap-4 pt-2 pb-4 border-b last:border-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Position #{position.id}</h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => removePosition(position.id)}
                        disabled={positions.length <= 1}
                      >
                        <Trash2 size={16} />
                        <span className="sr-only">Remove position</span>
                      </Button>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`position-title-${position.id}`}>Job Title</Label>
                      <Input
                        id={`position-title-${position.id}`}
                        placeholder="e.g. Frontend Developer"
                        value={position.title}
                        onChange={(e) => updatePosition(position.id, 'title', e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`position-requirements-${position.id}`}>Requirements</Label>
                      <Textarea
                        id={`position-requirements-${position.id}`}
                        placeholder="Describe the key requirements and responsibilities"
                        value={position.requirements}
                        onChange={(e) => updatePosition(position.id, 'requirements', e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`position-tags-${position.id}`}>Skills & Tags (comma separated)</Label>
                      <Input
                        id={`position-tags-${position.id}`}
                        placeholder="e.g. React, TypeScript, 3+ years"
                        value={position.tags}
                        onChange={(e) => updatePosition(position.id, 'tags', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline">Cancel</Button>
              <Button type="submit">Create Event</Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default EventSetup;
