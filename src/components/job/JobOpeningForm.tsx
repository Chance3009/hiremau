import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload, X, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { extractJobDetails, suggestSkillsAndRequirements } from '@/services/jobAI';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface JobOpeningFormProps {
    onSubmit: (data: {
        title: string;
        department: string;
        location: string;
        description: string;
        requirements: string[];
        salary: {
            min: string;
            max: string;
            currency: string;
            period: string;
        };
        employmentType: string;
        experienceLevel: string;
        benefits: string[];
    }) => void;
    onCancel: () => void;
}

const JobOpeningForm: React.FC<JobOpeningFormProps> = ({ onSubmit, onCancel }) => {
    const [title, setTitle] = useState('');
    const [department, setDepartment] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [requirements, setRequirements] = useState<string[]>(['']);
    const [newRequirement, setNewRequirement] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const [salaryMin, setSalaryMin] = useState('');
    const [salaryMax, setSalaryMax] = useState('');
    const [salaryCurrency, setSalaryCurrency] = useState('USD');
    const [salaryPeriod, setSalaryPeriod] = useState('year');
    const [employmentType, setEmploymentType] = useState('full-time');
    const [experienceLevel, setExperienceLevel] = useState('mid-level');
    const [benefits, setBenefits] = useState<string[]>([
        'Health Insurance',
        'Remote Work',
        '401(k)',
        'Paid Time Off'
    ]);

    // Handle file drop and upload
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = e.dataTransfer.files;
        if (files?.[0]) {
            await processFile(files[0]);
        }
    };

    const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files?.[0]) {
            await processFile(files[0]);
        }
    };

    const processFile = async (file: File) => {
        setIsProcessing(true);
        try {
            const text = await file.text();

            // Extract job details
            const extractedData = await extractJobDetails(text);

            // Get suggested skills
            const skills = await suggestSkillsAndRequirements(text);

            // Update form fields
            setTitle(extractedData.title);
            setDepartment(extractedData.department);
            setLocation(extractedData.location);
            setDescription(extractedData.description);
            setRequirements(extractedData.requirements);
            setSuggestedSkills(skills);

            toast({
                title: "File Processed",
                description: "Successfully extracted job details and suggestions.",
            });
        } catch (error) {
            toast({
                title: "Processing Failed",
                description: "Failed to process the file. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const addSuggestedSkill = (skill: string) => {
        if (!requirements.includes(skill)) {
            setRequirements([...requirements, skill]);
        }
    };

    const addRequirement = () => {
        if (newRequirement.trim()) {
            setRequirements([...requirements, newRequirement.trim()]);
            setNewRequirement('');
        }
    };

    const removeRequirement = (index: number) => {
        setRequirements(requirements.filter((_, i) => i !== index));
    };

    const editRequirement = (index: number, value: string) => {
        const newRequirements = [...requirements];
        newRequirements[index] = value;
        setRequirements(newRequirements);
    };

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const filteredRequirements = requirements.filter(req => req.trim() !== '');
        onSubmit({
            title,
            department,
            location,
            description,
            requirements: filteredRequirements,
            salary: {
                min: salaryMin,
                max: salaryMax,
                currency: salaryCurrency,
                period: salaryPeriod
            },
            employmentType,
            experienceLevel,
            benefits
        });
    };

    return (
        <Card className="w-full max-w-[1400px] mx-auto">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onCancel}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h2 className="text-2xl font-bold">Create Job Opening</h2>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* File Upload Section - Made more compact */}
                    <div
                        className={`border-2 border-dashed rounded-lg p-4 text-center ${dragActive ? 'border-primary bg-primary/5' : 'border-border'}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <Input
                            type="file"
                            className="hidden"
                            id="file-upload"
                            accept=".txt,.pdf,.doc,.docx"
                            onChange={handleFileInput}
                        />
                        <Label
                            htmlFor="file-upload"
                            className="cursor-pointer flex items-center justify-center gap-3"
                        >
                            <Upload className="h-6 w-6 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">
                                    Upload Job Description
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Drop your file here or click to browse
                                </p>
                            </div>
                        </Label>
                    </div>

                    {isProcessing && (
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing file...
                        </div>
                    )}

                    {/* Main Form Grid - Three columns for better horizontal space usage */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Column 1: Basic Info */}
                        <div className="space-y-4">
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

                        {/* Column 2: Job Details */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Employment Type</Label>
                                <Select value={employmentType} onValueChange={setEmploymentType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="full-time">Full-time</SelectItem>
                                        <SelectItem value="part-time">Part-time</SelectItem>
                                        <SelectItem value="contract">Contract</SelectItem>
                                        <SelectItem value="internship">Internship</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Experience Level</Label>
                                <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="entry-level">Entry Level</SelectItem>
                                        <SelectItem value="mid-level">Mid Level</SelectItem>
                                        <SelectItem value="senior">Senior</SelectItem>
                                        <SelectItem value="lead">Lead</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-2">
                                    <Label>Currency</Label>
                                    <Select value={salaryCurrency} onValueChange={setSalaryCurrency}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USD">USD</SelectItem>
                                            <SelectItem value="EUR">EUR</SelectItem>
                                            <SelectItem value="GBP">GBP</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Period</Label>
                                    <Select value={salaryPeriod} onValueChange={setSalaryPeriod}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="year">Per Year</SelectItem>
                                            <SelectItem value="month">Per Month</SelectItem>
                                            <SelectItem value="hour">Per Hour</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Column 3: Requirements */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Requirements</Label>
                                <div className="space-y-2">
                                    {requirements.map((req, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                value={req}
                                                onChange={(e) => editRequirement(index, e.target.value)}
                                                placeholder="Enter requirement"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => removeRequirement(index)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <div className="flex gap-2">
                                        <Input
                                            value={newRequirement}
                                            onChange={(e) => setNewRequirement(e.target.value)}
                                            placeholder="Add new requirement"
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addRequirement();
                                                }
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            onClick={addRequirement}
                                        >
                                            Add
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {suggestedSkills.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Suggested Skills</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {suggestedSkills.map((skill, index) => (
                                            <Badge
                                                key={index}
                                                className="cursor-pointer"
                                                variant="secondary"
                                                onClick={() => addSuggestedSkill(skill)}
                                            >
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Description Section - Full width at bottom */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Job Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Enter the detailed job description..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-[100px]"
                            required
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            Create Job Opening
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default JobOpeningForm; 