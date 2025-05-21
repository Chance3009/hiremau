
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Check, Clock, X, Users } from 'lucide-react';

const Dashboard = () => {
  // Mock data for the dashboard
  const candidateStats = [
    {
      title: "Total Candidates",
      value: 74,
      icon: <Users className="h-5 w-5" />,
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      title: "Shortlisted",
      value: 28,
      icon: <Check className="h-5 w-5" />,
      color: "text-green-500",
      bgColor: "bg-green-50"
    },
    {
      title: "Keep in View",
      value: 31,
      icon: <Clock className="h-5 w-5" />,
      color: "text-amber-500",
      bgColor: "bg-amber-50"
    },
    {
      title: "Rejected",
      value: 15,
      icon: <X className="h-5 w-5" />,
      color: "text-red-500",
      bgColor: "bg-red-50"
    }
  ];

  const skillsData = [
    { name: 'JavaScript', count: 45 },
    { name: 'React', count: 35 },
    { name: 'TypeScript', count: 30 },
    { name: 'Node.js', count: 25 },
    { name: 'Python', count: 20 },
    { name: 'Java', count: 15 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your recruitment activities and candidate metrics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {candidateStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} ${stat.color} p-3 rounded-full`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Candidate Status Distribution</CardTitle>
            <CardDescription>Breakdown of candidates by status</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Shortlisted', value: 28, color: '#4CAF50' },
                    { name: 'Keep in View', value: 31, color: '#FFC107' },
                    { name: 'Rejected', value: 15, color: '#F44336' },
                  ]}
                  margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill={(entry) => entry.color} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Most Common Skills</CardTitle>
            <CardDescription>Top skills among candidates</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={skillsData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366F1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
