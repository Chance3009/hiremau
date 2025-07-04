import React, { useState, useEffect } from 'react';
import { getCandidatesByStage, type Candidate } from '@/services/candidateService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Mail, Phone, Calendar, Building2, Eye } from 'lucide-react';

interface CandidateListProps {
  stage?: string;
}

const CandidateList: React.FC<CandidateListProps> = ({ stage = 'applied' }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');

  useEffect(() => {
    loadCandidates();
  }, [stage]);

  const loadCandidates = async () => {
    try {
      setIsLoading(true);
      const data = await getCandidatesByStage(stage);
      setCandidates(data);
    } catch (error) {
      console.error('Error loading candidates:', error);
      toast({
        title: "Error",
        description: "Failed to load candidates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-lg border-dashed">
        <div className="text-center">
          <h3 className="text-lg font-medium">No Candidates Found</h3>
          <p className="text-sm text-muted-foreground">
            There are no candidates in this stage yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'list' | 'card')} className="w-auto">
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="card">Card View</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {viewMode === 'list' ? (
        <div className="space-y-2">
          {candidates.map((candidate) => (
            <Card key={candidate.id} className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">{candidate.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        <span>{candidate.current_position}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        <span>{candidate.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        <span>{candidate.phone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(candidate.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{candidate.source}</Badge>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {candidates.map((candidate) => (
            <Card key={candidate.id} className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{candidate.name}</h3>
                      <p className="text-sm text-muted-foreground">{candidate.current_position}</p>
                    </div>
                    <Badge variant="secondary">{candidate.source}</Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{candidate.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{candidate.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(candidate.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CandidateList;
