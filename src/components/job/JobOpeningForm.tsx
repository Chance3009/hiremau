import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { extractJobDetails, suggestJobDescriptionImprovements } from '@/services/jobAI';

interface JobOpeningFormProps {
    onSubmit: (data: {
        title: string;
        department: string;
        location: string;
        description: string;
        requirements: string[];
    }) => void;
    onCancel: () => void;
}

const JobOpeningForm: React.FC<JobOpeningFormProps> = ({ onSubmit, onCancel }) => {
    // Form state
    const [title, setTitle] = useState('');
    const [department, setDepartment] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [requirements, setRequirements] = useState<string[]>(['']);
    const [jobDescriptionText, setJobDescriptionText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Add/remove requirement fields
    const addRequirement = () => {
        setRequirements([...requirements, '']);
    };

    const removeRequirement = (index: number) => {
        const newRequirements = requirements.filter((_, i) => i !== index);
        setRequirements(newRequirements.length ? newRequirements : ['']);
    };

    const updateRequirement = (index: number, value: string) => {
        const newRequirements = [...requirements];
        newRequirements[index] = value;
        setRequirements(newRequirements);
    };

    // Handle manual form submission
    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const filteredRequirements = requirements.filter(req => req.trim() !== '');
        onSubmit({
            title,
            department,
            location,
            description,
            requirements: filteredRequirements,
        });
    };

    // Handle AI extraction from job description
    const handleAIExtraction = async () => {
        setIsProcessing(true);
        try {
            // Extract job details using AI
            const extractedData = await extractJobDetails(jobDescriptionText);

            // Get suggestions for improvements
            const suggestions = await suggestJobDescriptionImprovements(jobDescriptionText);

            // Update form fields with extracted data
            setTitle(extractedData.title);
            setDepartment(extractedData.department);
            setLocation(extractedData.location);
            setDescription(extractedData.description);
            setRequirements(extractedData.requirements);

            // Show success message with suggestions
            toast({
                title: "Job Description Processed",
                description: (
                    <div className="mt-2 space-y-2">
                        <p>Successfully extracted job details using AI.</p>
                        {suggestions.length > 0 && (
                            <div className="text-sm">
                                <p className="font-medium">Suggestions for improvement:</p>
                                <ul className="list-disc pl-4">
                                    {suggestions.map((suggestion, index) => (
                                        <li key={index}>{suggestion}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ),
            });
        } catch (error) {
            toast({
                title: "Processing Failed",
                description: "Failed to extract job details. Please try again or use manual input.",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual">Manual Input</TabsTrigger>
                <TabsTrigger value="ai">AI Extract</TabsTrigger>
            </TabsList>

            <TabsContent value="manual">
                <Card>
                    <CardHeader>
                        <CardTitle>Create Job Opening</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleManualSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Job Title</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g. Senior Frontend Developer"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="department">Department</Label>
                                    <Input
                                        id="department"
                                        placeholder="e.g. Engineering"
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        placeholder="e.g. Remote, Hybrid - New York"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Job Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Enter the job description..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                    className="min-h-[100px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Requirements</Label>
                                <div className="space-y-2">
                                    {requirements.map((req, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                placeholder="Enter a requirement"
                                                value={req}
                                                onChange={(e) => updateRequirement(index, e.target.value)}
                                                required
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => removeRequirement(index)}
                                                disabled={requirements.length === 1}
                                            >
                                                -
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addRequirement}
                                >
                                    Add Requirement
                                </Button>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={onCancel}>
                                    Cancel
                                </Button>
                                <Button type="submit">Create Job Opening</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="ai">
                <Card>
                    <CardHeader>
                        <CardTitle>Extract from Job Description</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="job-description">Paste Job Description</Label>
                            <Textarea
                                id="job-description"
                                placeholder="Paste the complete job description here..."
                                value={jobDescriptionText}
                                onChange={(e) => setJobDescriptionText(e.target.value)}
                                className="min-h-[300px]"
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={onCancel}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAIExtraction}
                                disabled={!jobDescriptionText.trim() || isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    'Extract Details'
                                )}
                            </Button>
                        </div>

                        {isProcessing && (
                            <div className="text-sm text-muted-foreground">
                                AI is analyzing the job description and extracting relevant details...
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
};

export default JobOpeningForm; 