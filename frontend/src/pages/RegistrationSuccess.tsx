import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    CheckCircle, Calendar, MapPin, Clock, Users,
    Mail, Phone, ArrowRight, Home, Building
} from 'lucide-react';
import { API_CONFIG } from '@/config/constants';

const RegistrationSuccess = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVENTS}/${eventId}`);
                if (response.ok) {
                    const eventData = await response.json();
                    setEvent(eventData);
                }
            } catch (error) {
                console.error('Error fetching event:', error);
            } finally {
                setLoading(false);
            }
        };

        if (eventId) {
            fetchEvent();
        }
    }, [eventId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Registration Successful!</h1>
                    <p className="text-gray-600">Thank you for registering. We're excited to see you at the event!</p>
                </div>

                {/* Event Details */}
                {event && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building className="h-5 w-5" />
                                {event.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-500" />
                                    <span>Date: {event.date}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-gray-500" />
                                    <span>Location: {event.location}</span>
                                </div>
                                {event.time && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-500" />
                                        <span>Time: {event.time}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-gray-500" />
                                    <span>Registered: {(event.registrations || 0) + 1}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Next Steps */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>What's Next?</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-semibold text-blue-600">1</span>
                                </div>
                                <div>
                                    <h3 className="font-medium">Check Your Email</h3>
                                    <p className="text-sm text-gray-600">
                                        We've sent you a confirmation email with event details and important information.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-semibold text-blue-600">2</span>
                                </div>
                                <div>
                                    <h3 className="font-medium">Prepare Your Documents</h3>
                                    <p className="text-sm text-gray-600">
                                        Bring multiple copies of your resume and any relevant certificates.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-semibold text-blue-600">3</span>
                                </div>
                                <div>
                                    <h3 className="font-medium">Arrive Early</h3>
                                    <p className="text-sm text-gray-600">
                                        Plan to arrive 15-30 minutes early for a smooth check-in process.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Information */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Need Help?</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">
                                    Email us at: <a href="mailto:events@hiremau.com" className="text-blue-600 hover:underline">events@hiremau.com</a>
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">
                                    Call us at: <a href="tel:+60123456789" className="text-blue-600 hover:underline">+60 12-345 6789</a>
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        onClick={() => navigate(`/register/${eventId}`)}
                        variant="outline"
                        className="flex-1"
                    >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Register Another Person
                    </Button>

                    <Button
                        onClick={() => window.location.href = '/'}
                        className="flex-1"
                    >
                        <Home className="h-4 w-4 mr-2" />
                        Back to Home
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default RegistrationSuccess; 