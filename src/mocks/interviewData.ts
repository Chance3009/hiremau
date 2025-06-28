import { Candidate, Interview, Position, InterviewReport } from '@/types';

// Mock Positions
export const mockPositions: Position[] = [
    {
        id: '1',
        title: 'Frontend Developer',
        department: 'Engineering',
        location: 'Remote',
        description: 'Looking for a skilled Frontend Developer to join our team.',
        requirements: [
            'Strong proficiency in React and TypeScript',
            'Experience with modern frontend frameworks',
            'Knowledge of responsive design principles',
            'Understanding of web performance optimization',
        ],
    },
    {
        id: '2',
        title: 'UX Designer',
        department: 'Design',
        location: 'San Francisco',
        description: 'Seeking a creative UX Designer to help shape our product experience.',
        requirements: [
            'Proficiency in design tools like Figma',
            'Experience with user research',
            'Strong portfolio of web/mobile designs',
            'Understanding of design systems',
        ],
    },
    {
        id: '3',
        title: 'Backend Developer',
        department: 'Engineering',
        location: 'Hybrid - San Francisco',
        description: 'We are looking for a Backend Developer with expertise in building scalable and reliable API services.',
        requirements: [
            'Strong proficiency in Node.js and TypeScript',
            'Experience with SQL and NoSQL databases',
            'Knowledge of RESTful API design principles',
            'Experience with cloud services',
            'Understanding of security best practices',
        ],
    },
];

// Mock Candidates with detailed information
export const mockCandidates: Candidate[] = [
    {
        id: '1',
        name: 'Alex Johnson',
        position: 'Frontend Developer',
        email: 'alex.j@example.com',
        phone: '+1 234-567-8900',
        currentCompany: 'TechCorp Inc.',
        skills: ['React', 'TypeScript', 'Node.js', 'CSS'],
        experience: '5 years',
        education: 'B.S. Computer Science',
        status: 'shortlisted',
        eventId: '1',
        positionId: '1',
        screeningScore: 85,
        aiMatch: 78,
        availability: ['Monday', 'Wednesday', 'Friday'],
        preferredTime: 'Morning',
        appliedDate: '2024-03-15',
        lastPosition: 'Senior Frontend Developer',
        expectedSalary: '$120,000',
        location: 'San Francisco, CA',
        visaStatus: 'Citizen',
        tags: ['Remote OK', 'Senior Level'],
        screeningNotes: 'Strong technical background, good communication skills',
        aiSummary: {
            strengths: [
                'Strong technical background in React',
                'Proven experience with TypeScript',
                'Good problem-solving skills'
            ],
            considerations: [
                'Limited backend experience',
                'No experience with our specific tech stack'
            ],
            fitAnalysis: 'Strong potential fit for the frontend role with room to grow into full-stack development.'
        },
        aiAnalysis: {
            overallMatch: 85,
            skillMatches: [
                { skill: 'React', score: 95, required: true, experience: '5 years' },
                { skill: 'TypeScript', score: 88, required: true, experience: '3 years' },
                { skill: 'Node.js', score: 75, required: false, experience: '2 years' }
            ],
            cultureFit: 90,
            growthPotential: 85,
            riskFactors: [
                {
                    type: 'retention',
                    severity: 'low',
                    description: 'Multiple long-term positions in past roles'
                }
            ],
            insights: [
                {
                    type: 'strength',
                    description: 'Strong expertise in modern frontend technologies'
                },
                {
                    type: 'opportunity',
                    description: 'Potential for technical leadership role'
                }
            ],
            recommendedRole: 'Senior Frontend Developer',
            similarRoles: ['Frontend Tech Lead', 'Full Stack Developer'],
            learningPath: [
                {
                    skill: 'System Design',
                    priority: 'high',
                    estimatedTimeToAcquire: '3 months'
                }
            ]
        }
    },
    {
        id: '2',
        name: 'Emily Chen',
        position: 'Full Stack Developer',
        email: 'emily@example.com',
        phone: '+1 234-567-8901',
        currentCompany: 'DevCorp',
        skills: ['Node.js', 'React', 'Python', 'AWS', 'MongoDB'],
        experience: '7 years',
        education: 'M.S. Computer Science',
        status: 'scheduled',
        eventId: '2',
        positionId: '3',
        screeningScore: 92,
        aiMatch: 85,
        availability: ['Tuesday', 'Thursday'],
        preferredTime: 'Afternoon',
        appliedDate: '2024-03-14',
        lastPosition: 'Senior Full Stack Developer',
        expectedSalary: '$140,000',
        location: 'New York, NY',
        visaStatus: 'H1B',
        tags: ['Full Stack', 'Senior Level'],
        screeningNotes: 'Exceptional technical breadth and leadership potential',
        aiSummary: {
            strengths: [
                'Full stack expertise',
                'System design skills',
                'Team leadership experience'
            ],
            considerations: [
                'Higher salary expectations',
                'Needs visa sponsorship'
            ],
            fitAnalysis: 'Outstanding candidate with strong technical and leadership capabilities. Visa sponsorship required but worth considering.'
        },
        aiAnalysis: {
            overallMatch: 92,
            skillMatches: [
                { skill: 'Node.js', score: 95, required: true, experience: '7 years' },
                { skill: 'React', score: 90, required: true, experience: '5 years' },
                { skill: 'AWS', score: 88, required: true, experience: '4 years' }
            ],
            cultureFit: 95,
            growthPotential: 90,
            riskFactors: [
                {
                    type: 'visa',
                    severity: 'medium',
                    description: 'Requires visa sponsorship'
                }
            ],
            insights: [
                {
                    type: 'strength',
                    description: 'Strong full-stack expertise with proven leadership'
                },
                {
                    type: 'opportunity',
                    description: 'Could lead technical architecture initiatives'
                }
            ],
            recommendedRole: 'Senior Full Stack Developer',
            similarRoles: ['Technical Lead', 'Solution Architect'],
            learningPath: [
                {
                    skill: 'Cloud Architecture',
                    priority: 'medium',
                    estimatedTimeToAcquire: '2 months'
                }
            ]
        }
    }
];

// Mock Interview Data
export const mockInterviews: Interview[] = [
    {
        id: '1',
        candidateId: '1',
        eventId: '1',
        date: '2024-03-20',
        time: '10:00 AM',
        duration: 45,
        type: 'technical',
        status: 'scheduled',
        interviewer: {
            id: '1',
            name: 'Emma Rodriguez',
            role: 'Technical Lead'
        },
        room: 'Virtual Room 1',
        notes: [
            {
                text: 'Shows strong understanding of React architecture',
                timestamp: '10:32 AM'
            },
            {
                text: 'Limited experience with testing frameworks',
                timestamp: '10:45 AM'
            }
        ],
        messages: [
            {
                id: '1',
                type: 'question',
                content: 'Can you walk me through your experience with large-scale React applications?',
                timestamp: '10:30 AM',
                category: 'technical-experience',
                color: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900',
                aiAnalysis: {
                    type: 'baseline',
                    summary: 'Question targets core technical experience mentioned in resume',
                    confidence: 0.95
                }
            },
            {
                id: '2',
                type: 'answer',
                content: 'In my current role at TechCorp, I led the development of our customer dashboard that serves over 50,000 daily users. We used React with TypeScript, and I implemented a micro-frontend architecture to handle the scale.',
                timestamp: '10:31 AM',
                rating: 4,
                color: 'bg-white dark:bg-gray-800 border-gray-200',
                aiAnalysis: {
                    type: 'excellent',
                    summary: 'Strong technical leadership with proven scale experience',
                    confidence: 0.95,
                    keyPoints: ['Led large-scale project', 'Micro-frontend expertise'],
                    resumeMatch: true
                },
                quickLabels: ['Technical Leadership', 'Scale Experience']
            },
            {
                id: '3',
                type: 'answer',
                content: 'We mainly used basic unit tests, but I haven\'t worked much with integration testing.',
                timestamp: '10:32 AM',
                rating: 2,
                color: 'bg-white dark:bg-gray-800 border-gray-200',
                aiAnalysis: {
                    type: 'concern',
                    summary: 'Limited testing experience for senior role requirements',
                    confidence: 0.88,
                    keyPoints: ['Basic testing only', 'Gap in integration testing'],
                    resumeMatch: false
                },
                quickLabels: ['Limited Testing Experience']
            }
        ]
    },
    {
        id: '2',
        candidateId: '2',
        eventId: '2',
        date: '2024-03-21',
        time: '2:00 PM',
        duration: 60,
        type: 'technical',
        status: 'completed',
        interviewer: {
            id: '2',
            name: 'Michael Chen',
            role: 'Senior Developer'
        },
        room: 'Conference Room A',
        notes: [
            {
                text: 'Excellent system design knowledge',
                timestamp: '2:15 PM'
            },
            {
                text: 'Strong problem-solving skills demonstrated',
                timestamp: '2:45 PM'
            }
        ],
        messages: [
            {
                id: '1',
                type: 'question',
                content: 'Can you describe your experience with microservices architecture?',
                timestamp: '2:00 PM',
                category: 'technical-experience',
                color: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900',
                aiAnalysis: {
                    type: 'baseline',
                    summary: 'Question targets system design experience',
                    confidence: 0.95
                }
            },
            {
                id: '2',
                type: 'answer',
                content: 'I have extensive experience designing and implementing microservices. In my current role, I led the migration from a monolithic architecture to microservices, improving scalability and deployment efficiency.',
                timestamp: '2:05 PM',
                rating: 5,
                color: 'bg-white dark:bg-gray-800 border-gray-200',
                aiAnalysis: {
                    type: 'excellent',
                    summary: 'Demonstrates deep understanding of microservices architecture',
                    confidence: 0.98,
                    keyPoints: ['Led architecture migration', 'Focus on scalability'],
                    resumeMatch: true
                },
                quickLabels: ['Architecture Experience', 'Leadership']
            }
        ]
    }
];

// Mock Interview Reports
export const mockInterviewReports: InterviewReport[] = [
    {
        id: '1',
        interviewId: '1',
        candidateId: '1',
        interviewer: {
            id: '1',
            name: 'Emma Rodriguez',
            role: 'Technical Lead'
        },
        date: '2024-03-20',
        duration: 45,
        quickLabels: [
            'Strong Technical Skills',
            'Good Communication',
            'Leadership Experience',
            'Needs Clarification on Testing'
        ],
        quickNotes: [
            {
                text: 'Shows strong understanding of React architecture',
                timestamp: '10:32 AM'
            },
            {
                text: 'Limited experience with testing frameworks',
                timestamp: '10:45 AM'
            }
        ],
        aiAnalysis: {
            overallScore: 85,
            confidence: 0.92,
            strengths: [
                'Deep technical knowledge in React and TypeScript',
                'Excellent problem-solving approach',
                'Strong team leadership experience'
            ],
            concerns: [
                'Limited testing experience',
                'Some gaps in cloud architecture knowledge'
            ],
            keyHighlights: [
                {
                    type: 'positive',
                    point: 'Led a team of 5 developers in previous role',
                    confidence: 0.95
                },
                {
                    type: 'positive',
                    point: 'Implemented complex state management solutions',
                    confidence: 0.88
                },
                {
                    type: 'concern',
                    point: 'Limited experience with integration testing',
                    confidence: 0.85
                }
            ],
            resumeMatches: {
                matching: [
                    'React experience',
                    'Team leadership',
                    'Project management'
                ],
                discrepancies: [
                    'Years of cloud experience'
                ]
            }
        }
    }
];

// Mock Interviewers
export const mockInterviewers = [
    { id: '1', name: 'Emma Rodriguez', role: 'Technical Lead' },
    { id: '2', name: 'Michael Chen', role: 'Senior Developer' },
    { id: '3', name: 'Sarah Kim', role: 'Engineering Manager' }
];

// Mock Time Slots
export const mockTimeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '01:00 PM', '01:30 PM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM'
]; 