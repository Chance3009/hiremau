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

const TechIntegratorDashboard = () => {
    const navigate = useNavigate();

    const systemMetrics = [
        {
            title: "System Health",
            value: "98.5%",
            change: "Optimal",
            icon: <Activity className="h-5 w-5" />,
            color: "text-green-500 bg-green-50"
        },
        {
            title: "Active Integrations",
            value: "8",
            change: "All systems operational",
            icon: <Link className="h-5 w-5" />,
            color: "text-blue-500 bg-blue-50"
        },
        {
            title: "AI Processing",
            value: "2.1s",
            change: "Avg. response time",
            icon: <Cpu className="h-5 w-5" />,
            color: "text-purple-500 bg-purple-50"
        }
    ];

    const integrationStatus = [
        {
            name: "ATS Integration",
            status: "operational",
            latency: "45ms",
            lastSync: "2 min ago"
        },
        {
            name: "OpenAI API",
            status: "operational",
            latency: "280ms",
            lastSync: "1 min ago"
        },
        {
            name: "Document Parser",
            status: "warning",
            latency: "890ms",
            lastSync: "5 min ago"
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
                    <h1 className="text-2xl font-bold tracking-tight">System Dashboard</h1>
                    <p className="text-muted-foreground">Integration and system health monitoring</p>
                </div>
                <Button onClick={() => navigate('/settings/integrations')}>
                    Manage Integrations
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {systemMetrics.map((metric, index) => (
                    <Card key={index}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                                    <p className="text-2xl font-bold mt-1">{metric.value}</p>
                                    <p className="text-sm text-muted-foreground mt-1">{metric.change}</p>
                                </div>
                                <div className={`p-3 rounded-full ${metric.color}`}>
                                    {metric.icon}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-semibold">Integration Status</CardTitle>
                            <RefreshCw className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <CardDescription>Real-time integration health and metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {integrationStatus.map((integration, index) => (
                                <div key={index} className="p-4 border rounded-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-medium">{integration.name}</p>
                                            <p className="text-sm text-muted-foreground">Last sync: {integration.lastSync}</p>
                                        </div>
                                        <div className={`px-2 py-1 rounded text-xs font-medium ${integration.status === 'operational'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {integration.status}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-1">
                                            <Activity className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">{integration.latency}</span>
                                        </div>
                                        <Button variant="outline" size="sm">
                                            Configure
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-semibold">System Alerts</CardTitle>
                            <Shield className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <CardDescription>Recent system notifications and alerts</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {systemAlerts.map((alert, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                                    <div className={`p-2 rounded-full ${alert.type === 'warning'
                                            ? 'bg-amber-100 text-amber-700'
                                            : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {alert.type === 'warning' ? <AlertTriangle className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
                                    </div>
                                    <div>
                                        <p className="font-medium">{alert.title}</p>
                                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
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