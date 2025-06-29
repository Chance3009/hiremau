import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
    Activity,
    Database,
    Cpu,
    Link,
    AlertTriangle,
    Settings,
    RefreshCw,
    Shield
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const TechIntegratorDashboard = () => {
    const navigate = useNavigate();

    const systemMetrics = [
        {
            title: "System Health",
            value: "98.5%",
            icon: <Activity className="h-4 w-4" />,
            color: "text-green-500",
            bgColor: "bg-green-50",
            trend: "Optimal",
            trendLabel: "all systems",
            trendUp: true
        },
        {
            title: "Active Integrations",
            value: "8",
            icon: <Link className="h-4 w-4" />,
            color: "text-blue-500",
            bgColor: "bg-blue-50",
            trend: "100%",
            trendLabel: "operational",
            trendUp: true
        },
        {
            title: "AI Processing",
            value: "2.1s",
            icon: <Cpu className="h-4 w-4" />,
            color: "text-purple-500",
            bgColor: "bg-purple-50",
            trend: "-0.3s",
            trendLabel: "vs last hour",
            trendUp: true
        },
        {
            title: "API Usage",
            value: "76%",
            icon: <Database className="h-4 w-4" />,
            color: "text-amber-500",
            bgColor: "bg-amber-50",
            trend: "24%",
            trendLabel: "remaining",
            trendUp: false
        }
    ];

    const integrationStatus = [
        {
            name: "ATS Integration",
            status: "operational",
            latency: "45ms",
            lastSync: "2 min ago",
            uptime: 99.9
        },
        {
            name: "OpenAI API",
            status: "operational",
            latency: "280ms",
            lastSync: "1 min ago",
            uptime: 99.5
        },
        {
            name: "Document Parser",
            status: "warning",
            latency: "890ms",
            lastSync: "5 min ago",
            uptime: 98.2
        }
    ];

    const systemAlerts = [
        {
            title: "High API Usage",
            description: "OpenAI API usage approaching limit",
            type: "warning",
            time: "10 min ago"
        },
        {
            title: "New Security Update",
            description: "Security patch available for deployment",
            type: "info",
            time: "1 hour ago"
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">System Dashboard</h1>
                    <p className="text-muted-foreground">Integration and system health monitoring</p>
                </div>
                <Button onClick={() => navigate('/settings/integrations')}>
                    Manage Integrations
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {systemMetrics.map((metric, index) => (
                    <Card key={index}>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className={cn("p-2.5 rounded-lg", metric.bgColor)}>
                                    {metric.icon}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-muted-foreground truncate">{metric.title}</p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-2xl font-bold">{metric.value}</p>
                                        <div className={cn(
                                            "flex items-center text-xs font-medium",
                                            metric.trendUp ? "text-green-600" : "text-amber-600"
                                        )}>
                                            {metric.trend}
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{metric.trendLabel}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-2">
                    <CardHeader className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Integration Status</CardTitle>
                                <CardDescription>Real-time integration health and metrics</CardDescription>
                            </div>
                            <RefreshCw className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                        <div className="space-y-4">
                            {integrationStatus.map((integration, index) => (
                                <div key={index} className="space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium">{integration.name}</p>
                                            <p className="text-sm text-muted-foreground">Last sync: {integration.lastSync}</p>
                                        </div>
                                        <div className={cn(
                                            "px-2 py-1 rounded text-xs font-medium",
                                            integration.status === 'operational'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-amber-100 text-amber-700'
                                        )}>
                                            {integration.status}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <Progress value={integration.uptime} className="h-2" />
                                        </div>
                                        <div className="text-sm font-medium">{integration.latency}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-1">
                    <CardHeader className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>System Alerts</CardTitle>
                                <CardDescription>Recent notifications and updates</CardDescription>
                            </div>
                            <Shield className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                        <div className="space-y-4">
                            {systemAlerts.map((alert, index) => (
                                <div key={index} className="p-3 bg-muted/50 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <div className={cn(
                                            "p-1.5 rounded-full",
                                            alert.type === 'warning' ? 'bg-amber-100' : 'bg-blue-100'
                                        )}>
                                            {alert.type === 'warning' ? (
                                                <AlertTriangle className="h-3 w-3 text-amber-600" />
                                            ) : (
                                                <Settings className="h-3 w-3 text-blue-600" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm">{alert.title}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                                        </div>
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

export default TechIntegratorDashboard; 