import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Calendar, Activity, QrCode, BarChart3,
    ArrowRight, Presentation, Users, Brain
} from 'lucide-react';

import EventCreation from './pages/EventCreation';
import EventOps from './pages/EventOps';
import FastCheckIn from './components/event/FastCheckIn';

const DemoApp = () => {
    const [currentDemo, setCurrentDemo] = useState('home');

    const demoScreens = [
        {
            id: 'creation',
            title: 'Event Creation',
            description: 'Set up recruitment events with AI integration',
            icon: <Calendar className="h-5 w-5" />,
            component: <EventCreation />,
            color: 'bg-blue-50 border-blue-200',
            time: '2 mins'
        },
        {
            id: 'operations',
            title: 'Operations Dashboard',
            description: 'Real-time monitoring and analytics',
            icon: <BarChart3 className="h-5 w-5" />,
            component: <EventOps />,
            color: 'bg-green-50 border-green-200',
            time: '4 mins'
        },
        {
            id: 'checkin',
            title: 'Fast Check-In',
            description: 'Streamlined candidate processing',
            icon: <QrCode className="h-5 w-5" />,
            component: <FastCheckIn />,
            color: 'bg-purple-50 border-purple-200',
            time: '4 mins'
        }
    ];

    if (currentDemo !== 'home') {
        const screen = demoScreens.find(s => s.id === currentDemo);
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="p-4 bg-white border-b shadow-sm">
                    <div className="flex items-center justify-between max-w-7xl mx-auto">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentDemo('home')}
                                size="sm"
                            >
                                ← Back to Demo Menu
                            </Button>
                            <div className="flex items-center gap-2">
                                {screen?.icon}
                                <span className="font-medium">{screen?.title}</span>
                                <Badge variant="secondary">{screen?.time}</Badge>
                            </div>
                        </div>
                        <Badge variant="outline" className="text-green-600">
                            Live Demo
                        </Badge>
                    </div>
                </div>
                <div className="p-6 max-w-7xl mx-auto">
                    {screen?.component}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="p-3 bg-blue-600 rounded-full">
                            <Presentation className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900">HireMau Demo</h1>
                    </div>
                    <p className="text-xl text-gray-600 mb-6">
                        Event-Based Screening Data Management System
                    </p>
                    <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>156 Candidates</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4" />
                            <span>94% AI Accuracy</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            <span>Live Event</span>
                        </div>
                    </div>
                </div>

                {/* Demo Navigation */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {demoScreens.map((screen, index) => (
                        <Card
                            key={screen.id}
                            className={`cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 ${screen.color}`}
                            onClick={() => setCurrentDemo(screen.id)}
                        >
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-full shadow-sm">
                                            {screen.icon}
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{screen.title}</CardTitle>
                                            <Badge variant="secondary" className="mt-1">
                                                Step {index + 1} • {screen.time}
                                            </Badge>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-gray-400" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 mb-4">{screen.description}</p>
                                <Button className="w-full" variant="default">
                                    View Demo
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Key Metrics Preview */}
                <Card className="bg-white/80 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="text-center">
                            Key Performance Indicators
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600 mb-1">70%</div>
                                <div className="text-sm text-gray-600">Faster Screening</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-600 mb-1">94%</div>
                                <div className="text-sm text-gray-600">AI Accuracy</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-purple-600 mb-1">3x</div>
                                <div className="text-sm text-gray-600">More Candidates</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-orange-600 mb-1">15h</div>
                                <div className="text-sm text-gray-600">Time Saved</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center mt-8 text-gray-500">
                    <p>Click on any demo card above to begin the presentation</p>
                </div>
            </div>
        </div>
    );
};

export default DemoApp; 