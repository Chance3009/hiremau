import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Calendar, MapPin, Clock, Users, Upload,
    CheckCircle, AlertCircle, Loader2, Building
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { API_CONFIG } from '@/config/constants';

const CandidateRegistration = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        current_position: '',
        years_experience: '',
        skills: '',
        education: '',
        linkedin_url: '',
        github_url: '',
        portfolio_url: '',
        preferred_work_type: '',
        salary_expectations: '',
        availability: '',
        notes: '',
        job_id: ''
    });

    // Fetch event details
    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVENTS}/${eventId}`);
                if (response.ok) {
                    const eventData = await response.json();
                    setEvent(eventData);
                } else {
                    toast({
                        title: "Error",
                        description: "Event not found",
                        variant: "destructive"
                    });
                }
            } catch (error) {
                console.error('Error fetching event:', error);
                toast({
                    title: "Error",
                    description: "Failed to load event details",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        if (eventId) {
            fetchEvent();
        }
    }, [eventId]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // First, create the candidate
            const candidateResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CANDIDATES}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    current_position: formData.current_position,
                    years_experience: formData.years_experience ? parseInt(formData.years_experience) : null,
                    skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : [],
                    education: formData.education,
                    linkedin_url: formData.linkedin_url,
                    github_url: formData.github_url,
                    portfolio_url: formData.portfolio_url,
                    preferred_work_type: formData.preferred_work_type,
                    salary_expectations: formData.salary_expectations ? parseFloat(formData.salary_expectations) : null,
                    availability: formData.availability,
                    notes: formData.notes,
                    event_id: eventId,
                    job_id: formData.job_id || null,
                    source: 'qr_registration'
                })
            });

            if (candidateResponse.ok) {
                const candidate = await candidateResponse.json();

                // Then, register the candidate for the event
                const registrationResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVENTS}/${eventId}/registrations`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        candidate_id: candidate.id,
                        job_id: formData.job_id || null
                    })
                });

                if (registrationResponse.ok) {
                    toast({
                        title: "Registration Successful! 🎉",
                        description: "Thank you for registering. We'll see you at the event!",
                    });

                    // Redirect to success page
                    navigate(`/registration-success/${eventId}`);
                } else {
                    throw new Error('Failed to register for event');
                }
            } else {
                throw new Error('Failed to create candidate profile');
            }
        } catch (error) {
            console.error('Registration error:', error);
            toast({
                title: "Registration Failed",
                description: error.message || "Something went wrong. Please try again.",
                variant: "destructive"
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading event details...</p>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6 text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h1 className="text-xl font-bold mb-2">Event Not Found</h1>
                        <p className="text-gray-600">The event you're looking for doesn't exist or has been removed.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                {/* Event Header */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Building className="h-8 w-8 text-blue-600" />
                            <div>
                                <h1 className="text-2xl font-bold">{event.title}</h1>
                                <p className="text-gray-600">Join us for this exciting opportunity!</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span>{event.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <span>{event.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-gray-500" />
                                <span>{event.registrations || 0} registered</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Registration Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Register for Event</CardTitle>
                        <CardDescription>
                            Fill out your details to register for this event. All fields marked with * are required.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Basic Information</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="name">Full Name *</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            required
                                            placeholder="Enter your full name"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="email">Email Address *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            required
                                            placeholder="your.email@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            placeholder="+60 12-345 6789"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="current_position">Current Position</Label>
                                        <Input
                                            id="current_position"
                                            type="text"
                                            value={formData.current_position}
                                            onChange={(e) => handleInputChange('current_position', e.target.value)}
                                            placeholder="e.g., Software Engineer"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Professional Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Professional Information</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="years_experience">Years of Experience</Label>
                                        <Select value={formData.years_experience} onValueChange={(value) => handleInputChange('years_experience', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select experience level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0">Fresh Graduate</SelectItem>
                                                <SelectItem value="1">1-2 years</SelectItem>
                                                <SelectItem value="3">3-5 years</SelectItem>
                                                <SelectItem value="6">6-10 years</SelectItem>
                                                <SelectItem value="11">10+ years</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="preferred_work_type">Preferred Work Type</Label>
                                        <Select value={formData.preferred_work_type} onValueChange={(value) => handleInputChange('preferred_work_type', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select work preference" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="remote">Remote</SelectItem>
                                                <SelectItem value="onsite">On-site</SelectItem>
                                                <SelectItem value="hybrid">Hybrid</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="skills">Skills (comma-separated)</Label>
                                    <Input
                                        id="skills"
                                        type="text"
                                        value={formData.skills}
                                        onChange={(e) => handleInputChange('skills', e.target.value)}
                                        placeholder="e.g., JavaScript, Python, React, Node.js"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="education">Education</Label>
                                    <Textarea
                                        id="education"
                                        value={formData.education}
                                        onChange={(e) => handleInputChange('education', e.target.value)}
                                        placeholder="Your educational background"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            {/* Links */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Professional Links</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="linkedin_url">LinkedIn Profile</Label>
                                        <Input
                                            id="linkedin_url"
                                            type="url"
                                            value={formData.linkedin_url}
                                            onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                                            placeholder="https://linkedin.com/in/yourprofile"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="github_url">GitHub Profile</Label>
                                        <Input
                                            id="github_url"
                                            type="url"
                                            value={formData.github_url}
                                            onChange={(e) => handleInputChange('github_url', e.target.value)}
                                            placeholder="https://github.com/yourusername"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="portfolio_url">Portfolio Website</Label>
                                    <Input
                                        id="portfolio_url"
                                        type="url"
                                        value={formData.portfolio_url}
                                        onChange={(e) => handleInputChange('portfolio_url', e.target.value)}
                                        placeholder="https://yourportfolio.com"
                                    />
                                </div>
                            </div>

                            {/* Additional Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Additional Information</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="salary_expectations">Salary Expectations (MYR)</Label>
                                        <Input
                                            id="salary_expectations"
                                            type="number"
                                            value={formData.salary_expectations}
                                            onChange={(e) => handleInputChange('salary_expectations', e.target.value)}
                                            placeholder="e.g., 8000"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="availability">Availability</Label>
                                        <Select value={formData.availability} onValueChange={(value) => handleInputChange('availability', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="When can you start?" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="immediately">Immediately</SelectItem>
                                                <SelectItem value="1-month">1 month notice</SelectItem>
                                                <SelectItem value="2-months">2 months notice</SelectItem>
                                                <SelectItem value="3-months">3+ months notice</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="notes">Additional Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={formData.notes}
                                        onChange={(e) => handleInputChange('notes', e.target.value)}
                                        placeholder="Any additional information you'd like to share..."
                                        rows={4}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Registering...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Register for Event
                                        </>
                                    )}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/')}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default CandidateRegistration; 