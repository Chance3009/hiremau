import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, PieChart, Pie, Legend } from 'recharts';
import { Check, Clock, X, Users, Briefcase, TrendingUp, Calendar, Target, ArrowUp, ArrowDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { PageHeader } from "@/components/ui/page-header";
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const candidateStats = [
    {
      title: "Active Jobs",
      value: 12,
      icon: <Briefcase className="h-4 w-4" />,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      trend: "+2",
      trendLabel: "this month",
      trendUp: true
    },
    {
      title: "Applications",
      value: 74,
      icon: <Users className="h-4 w-4" />,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      trend: "+15",
      trendLabel: "this week",
      trendUp: true
    },
    {
      title: "Time to Hire",
      value: "21d",
      icon: <TrendingUp className="h-4 w-4" />,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
      trend: "-3d",
      trendLabel: "vs last month",
      trendUp: false
    },
    {
      title: "Success Rate",
      value: "68%",
      icon: <Target className="h-4 w-4" />,
      color: "text-green-500",
      bgColor: "bg-green-50",
      trend: "+5%",
      trendLabel: "vs target",
      trendUp: true
    }
  ];

  const positionMetrics = [
    { position: "Software Engineer", total: 45, shortlisted: 15, interviewed: 8, offered: 3 },
    { position: "Product Manager", total: 38, shortlisted: 12, interviewed: 6, offered: 2 },
    { position: "UX Designer", total: 32, shortlisted: 10, interviewed: 5, offered: 1 },
    { position: "Data Scientist", total: 28, shortlisted: 8, interviewed: 4, offered: 2 },
  ];

  const departmentHiring = [
    { name: 'Engineering', openings: 5, applications: 35, fillRate: 85 },
    { name: 'Sales', openings: 3, applications: 22, fillRate: 65 },
    { name: 'Marketing', openings: 2, applications: 18, fillRate: 75 },
    { name: 'Product', openings: 2, applications: 15, fillRate: 90 },
  ];

  const hiringTrends = [
    { month: 'Jan', applications: 45, hires: 5, efficiency: 11.1 },
    { month: 'Feb', applications: 52, hires: 6, efficiency: 11.5 },
    { month: 'Mar', applications: 48, hires: 4, efficiency: 8.3 },
    { month: 'Apr', applications: 70, hires: 8, efficiency: 11.4 },
    { month: 'May', applications: 74, hires: 7, efficiency: 9.5 },
  ];

  const skillDemand = [
    { name: 'JavaScript', value: 25, growth: '+15%' },
    { name: 'React', value: 20, growth: '+25%' },
    { name: 'Python', value: 15, growth: '+10%' },
    { name: 'Java', value: 12, growth: '-5%' },
    { name: 'DevOps', value: 10, growth: '+30%' },
  ];

  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of recruitment activities and insights"
      >
        <Button onClick={() => navigate('/interview')}>
          Review Candidates
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {candidateStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={cn("p-2.5 rounded-lg", stat.bgColor)}>
                  {stat.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-muted-foreground truncate">{stat.title}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <div className={cn(
                      "flex items-center text-xs font-medium",
                      stat.trendUp ? "text-green-600" : "text-red-600"
                    )}>
                      {stat.trendUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      {stat.trend}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{stat.trendLabel}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="p-6">
          <CardTitle>Position Overview</CardTitle>
          <CardDescription>Recruitment pipeline by position</CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-4">
            {positionMetrics.map((position, index) => (
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
                <div className="flex gap-2">
                  <div className="bg-blue-100 h-2 rounded-full" style={{ width: `${(position.shortlisted / position.total) * 100}%` }} />
                  <div className="bg-green-100 h-2 rounded-full" style={{ width: `${(position.interviewed / position.total) * 100}%` }} />
                  <div className="bg-purple-100 h-2 rounded-full" style={{ width: `${(position.offered / position.total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="col-span-1">
          <CardHeader className="p-6">
            <CardTitle>Department Overview</CardTitle>
            <CardDescription>Hiring progress by department</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentHiring} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="openings" fill="#8884d8" name="Open Positions" />
                  <Bar dataKey="applications" fill="#82ca9d" name="Applications" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Highest Fill Rate</span>
                <span className="text-sm font-semibold">Product (90%)</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Most Active</span>
                <span className="text-sm font-semibold">Engineering</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="p-6">
            <CardTitle>Hiring Efficiency</CardTitle>
            <CardDescription>Monthly hiring trends and efficiency</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hiringTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="efficiency" stroke="#8884d8" name="Hire Rate %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Best Month</span>
                <span className="text-sm font-semibold">February (11.5%)</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Current Trend</span>
                <span className="text-sm font-semibold text-amber-500">↘ Declining</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-2">
          <CardHeader className="p-6">
            <CardTitle>Skills Demand & Growth</CardTitle>
            <CardDescription>Current skill requirements and trends</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {skillDemand.map((skill, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">{skill.name}</div>
                    <div className="text-sm text-muted-foreground">Demand: {skill.value}%</div>
                  </div>
                  <div className={cn(
                    "text-sm font-medium",
                    skill.growth.startsWith('+') ? "text-green-600" : "text-red-600"
                  )}>
                    {skill.growth}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
