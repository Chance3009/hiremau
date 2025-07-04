import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  TrendingUp,
  TrendingDown,
  Users,
  UserCheck,
  Calendar,
  Briefcase,
  Star,
  ArrowUpRight,
  Eye,
  Plus,
  Clock,
  Target,
  BarChart3,
  FileText,
  UserPlus2,
  CalendarPlus,
  Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRecruitment } from '@/contexts/RecruitmentContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { activePositionId, activeEventId } = useRecruitment();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Mock user role - would come from auth context
  const userRole = "HR Manager";
  const userName = "John Doe";

  // Enhanced metrics with better data
  const metrics = [
    {
      title: "Total Applications",
      value: "1,248",
      change: "+12.5%",
      trend: "up" as const,
      icon: Users,
      description: "Applications this month",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Shortlisted",
      value: "89",
      change: "+8.1%",
      trend: "up" as const,
      icon: UserCheck,
      description: "Candidates under review",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Interviews Scheduled",
      value: "34",
      change: "-2.4%",
      trend: "down" as const,
      icon: Calendar,
      description: "This week",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Offers Made",
      value: "12",
      change: "+15.8%",
      trend: "up" as const,
      icon: Star,
      description: "Pending responses",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const positionMetrics = [
    {
      position: "Frontend Developer",
      total: 324,
      shortlisted: 28,
      interviewed: 12,
      offered: 4,
      progress: 68,
      urgency: "high",
    },
    {
      position: "Backend Developer",
      total: 298,
      shortlisted: 24,
      interviewed: 10,
      offered: 3,
      progress: 55,
      urgency: "medium",
    },
    {
      position: "UX Designer",
      total: 156,
      shortlisted: 18,
      interviewed: 8,
      offered: 3,
      progress: 72,
      urgency: "low",
    },
    {
      position: "Product Manager",
      total: 89,
      shortlisted: 12,
      interviewed: 6,
      offered: 2,
      progress: 45,
      urgency: "high",
    },
  ];

  const quickActions = [
    {
      title: "Review Applications",
      description: "Review new candidate applications",
      icon: FileText,
      action: () => navigate('/applied'),
      count: 23,
      color: "bg-blue-500",
    },
    {
      title: "Schedule Interviews",
      description: "Schedule interviews for shortlisted candidates",
      icon: CalendarPlus,
      action: () => navigate('/screened'),
      count: 8,
      color: "bg-green-500",
    },
    {
      title: "Add Candidates",
      description: "Manually add new candidates",
      icon: UserPlus2,
      action: () => navigate('/candidate-intake'),
      count: null,
      color: "bg-orange-500",
    },
    {
      title: "Create Job Opening",
      description: "Post new job openings",
      icon: Plus,
      action: () => navigate('/job-openings/new'),
      count: null,
      color: "bg-purple-500",
    },
    {
      title: "Event Setup",
      description: "Create recruitment events",
      icon: Calendar,
      action: () => navigate('/event-setup'),
      count: null,
      color: "bg-indigo-500",
    },
    {
      title: "Analytics",
      description: "View detailed recruitment analytics",
      icon: BarChart3,
      action: () => navigate('/analytics'),
      count: null,
      color: "bg-pink-500",
    },
  ];

  const recentActivity = [
    {
      type: "application",
      message: "Sarah Chen applied for Frontend Developer",
      time: "2 hours ago",
      avatar: "SC",
    },
    {
      type: "interview",
      message: "Interview scheduled with Mike Johnson",
      time: "4 hours ago",
      avatar: "MJ",
    },
    {
      type: "offer",
      message: "Offer accepted by Lisa Wang",
      time: "1 day ago",
      avatar: "LW",
    },
    {
      type: "shortlist",
      message: "3 candidates shortlisted for UX Designer",
      time: "2 days ago",
      avatar: "UX",
    },
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "text-red-600 bg-red-50";
      case "medium": return "text-yellow-600 bg-yellow-50";
      case "low": return "text-green-600 bg-green-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Good {currentTime.getHours() < 12 ? 'morning' : currentTime.getHours() < 18 ? 'afternoon' : 'evening'}, {userName}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your recruitment pipeline today
            {(activePositionId || activeEventId) && (
              <span className="ml-2 text-primary font-medium">
                • Filtered view active
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/applied')}>
            <Eye className="h-4 w-4 mr-2" />
            View All Candidates
          </Button>
          <Button onClick={() => navigate('/candidate-intake')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Candidate
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <div className={`p-2 rounded-md ${metric.bgColor}`}>
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.description}
                </p>
                <div className={`text-xs flex items-center mt-2 ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {metric.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {metric.change} from last month
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Position Overview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Position Pipeline</CardTitle>
                  <CardDescription>
                    Recruitment progress by position
                    {activePositionId && (
                      <Badge variant="outline" className="ml-2">
                        Filtered
                      </Badge>
                    )}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/job-openings')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Manage
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {positionMetrics
                .filter(position => !activePositionId || position.position.toLowerCase().includes('frontend'))
                .map((position, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <h4 className="font-medium">{position.position}</h4>
                          <p className="text-sm text-muted-foreground">
                            {position.total} total applications
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={getUrgencyColor(position.urgency)}
                        >
                          {position.urgency} priority
                        </Badge>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="font-medium">{position.shortlisted}</p>
                          <p className="text-muted-foreground">Shortlisted</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{position.interviewed}</p>
                          <p className="text-muted-foreground">Interviewed</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{position.offered}</p>
                          <p className="text-muted-foreground">Offered</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{position.progress}%</span>
                      </div>
                      <Progress value={position.progress} className="h-2" />
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest recruitment updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-muted">
                      {activity.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full mt-4">
                View All Activity
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common recruitment tasks and workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center text-center hover:shadow-md transition-all"
                  onClick={action.action}
                >
                  <div className={`p-3 rounded-full ${action.color} text-white mb-3 relative`}>
                    <Icon className="h-5 w-5" />
                    {action.count && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                      >
                        {action.count}
                      </Badge>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm mb-1">{action.title}</p>
                    <p className="text-xs text-muted-foreground leading-tight">
                      {action.description}
                    </p>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
