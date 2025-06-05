import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, PieChart, Pie, Legend } from 'recharts';
import { Check, Clock, X, Users, Briefcase, TrendingUp, Calendar, Target, ArrowUp, ArrowDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

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

  return (
    <div className="section-spacing">
      <div className="page-header">
        <div>
          <h1 className="page-title">HR Dashboard</h1>
          <p className="page-subtitle">Recruitment metrics & insights</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            Last updated: <span className="font-medium">Just now</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {candidateStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="card-padding">
              <div className="flex items-center gap-2">
                <div className={cn("p-2 rounded-md", stat.bgColor)}>
                  {stat.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{stat.title}</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-lg font-bold">{stat.value}</p>
                    <div className={cn(
                      "flex items-center text-xs",
                      stat.trendUp ? "text-green-500" : "text-red-500"
                    )}>
                      {stat.trendUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      {stat.trend}
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{stat.trendLabel}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card className="col-span-1">
          <CardHeader className="card-padding">
            <CardTitle className="card-header-md">Department Overview</CardTitle>
          </CardHeader>
          <CardContent className="card-padding pt-0">
            <div className="h-[200px]">
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
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <span>Highest Fill Rate</span>
                <span className="font-medium">Product (90%)</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <span>Most Active</span>
                <span className="font-medium">Engineering</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="card-padding">
            <CardTitle className="card-header-md">Hiring Efficiency</CardTitle>
          </CardHeader>
          <CardContent className="card-padding pt-0">
            <div className="h-[200px]">
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
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <span>Best Month</span>
                <span className="font-medium">February (11.5%)</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <span>Current Trend</span>
                <span className="font-medium text-amber-500">↘ Declining</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-2">
          <CardHeader className="card-padding">
            <CardTitle className="card-header-md">Skills Demand & Growth</CardTitle>
          </CardHeader>
          <CardContent className="card-padding pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {skillDemand.map((skill, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <div>
                    <div className="font-medium">{skill.name}</div>
                    <div className="text-sm text-muted-foreground">Demand: {skill.value}%</div>
                  </div>
                  <div className={cn(
                    "text-sm font-medium",
                    skill.growth.startsWith('+') ? "text-green-500" : "text-red-500"
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
