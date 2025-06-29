import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, Users, UserCheck, Calendar, Briefcase, Star, ArrowUpRight, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlobalFilterDemo } from '@/components/layout/GlobalFilterDemo';
import { useRecruitment } from '@/contexts/RecruitmentContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { activePositionId, activeEventId } = useRecruitment();

  // Example metrics (would come from API)
  const metrics = [
    {
      title: "Total Applications",
      value: "1,248",
      change: "+12.5%",
      trend: "up" as const,
      icon: Users,
    },
    {
      title: "Shortlisted",
      value: "89",
      change: "+8.1%",
      trend: "up" as const,
      icon: UserCheck,
    },
    {
      title: "Interviews Scheduled",
      value: "34",
      change: "-2.4%",
      trend: "down" as const,
      icon: Calendar,
    },
    {
      title: "Offers Made",
      value: "12",
      change: "+15.8%",
      trend: "up" as const,
      icon: Star,
    },
  ];

  const positionMetrics = [
    {
      position: "Frontend Developer",
      total: 324,
      shortlisted: 28,
      interviewed: 12,
      offered: 4,
    },
    {
      position: "Backend Developer",
      total: 298,
      shortlisted: 24,
      interviewed: 10,
      offered: 3,
    },
    {
      position: "UX Designer",
      total: 156,
      shortlisted: 18,
      interviewed: 8,
      offered: 3,
    },
    {
      position: "Product Manager",
      total: 89,
      shortlisted: 12,
      interviewed: 6,
      offered: 2,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Global Filter Demo */}
      <GlobalFilterDemo />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your recruitment pipeline
            {(activePositionId || activeEventId) && (
              <span className="ml-2 text-primary">
                • Filtered view active
              </span>
            )}
          </p>
        </div>
        <Button onClick={() => navigate('/candidates/applied')}>
          <Eye className="h-4 w-4 mr-2" />
          View All Candidates
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className={`text-xs flex items-center ${metric.trend === 'up'
                  ? 'text-green-600'
                  : 'text-red-600'
                  }`}>
                  {metric.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {metric.change} from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Position Overview */}
      <Card>
        <CardHeader className="p-6">
          <CardTitle>Position Overview</CardTitle>
          <CardDescription>
            Recruitment pipeline by position
            {activePositionId && (
              <Badge variant="outline" className="ml-2">
                Filtered by Position
              </Badge>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-4">
            {positionMetrics
              .filter(position => !activePositionId || position.position.toLowerCase().includes('frontend'))
              .map((position, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{position.position}</h4>
                      <p className="text-sm text-muted-foreground">
                        {position.total} total applications
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-sm font-medium">{position.shortlisted}</p>
                        <p className="text-xs text-muted-foreground">Shortlisted</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">{position.interviewed}</p>
                        <p className="text-xs text-muted-foreground">Interviewed</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">{position.offered}</p>
                        <p className="text-xs text-muted-foreground">Offered</p>
                      </div>
                    </div>
                  </div>
                  <Progress
                    value={(position.shortlisted / position.total) * 100}
                    className="h-2"
                  />
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common recruitment tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
              onClick={() => navigate('/candidates/applied')}
            >
              <Users className="h-6 w-6 mb-2" />
              <div className="text-left">
                <p className="font-medium">Review Applications</p>
                <p className="text-sm text-muted-foreground">Process new candidates</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
              onClick={() => navigate('/interviews/schedule')}
            >
              <Calendar className="h-6 w-6 mb-2" />
              <div className="text-left">
                <p className="font-medium">Schedule Interviews</p>
                <p className="text-sm text-muted-foreground">Book interview slots</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
              onClick={() => navigate('/job-openings')}
            >
              <Briefcase className="h-6 w-6 mb-2" />
              <div className="text-left">
                <p className="font-medium">Manage Positions</p>
                <p className="text-sm text-muted-foreground">Edit job openings</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
