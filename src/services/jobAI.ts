interface JobDetails {
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
}

// Mock data for demo purposes
const mockSkills = {
    'developer': [
        'React', 'TypeScript', 'Node.js', 'GraphQL', 'Docker',
        'AWS', 'Git', 'REST APIs', 'Jest', 'CI/CD'
    ],
    'designer': [
        'Figma', 'Adobe XD', 'UI/UX', 'Prototyping', 'User Research',
        'Design Systems', 'Responsive Design', 'Sketch', 'Adobe Creative Suite'
    ],
    'manager': [
        'Agile', 'Project Management', 'Team Leadership', 'Strategic Planning',
        'Stakeholder Management', 'Risk Management', 'Budgeting'
    ]
};

export const extractJobDetails = async (text: string) => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // For demo, just return mock data
    return {
        title: 'Senior Frontend Developer',
        department: 'Engineering',
        location: 'Remote / Hybrid - New York',
        description: `We are looking for a Senior Frontend Developer to join our growing team. You will be responsible for:

• Building responsive and performant user interfaces
• Collaborating with designers and backend engineers
• Mentoring junior developers
• Contributing to our design system
• Leading technical discussions and code reviews

Our tech stack includes React, TypeScript, GraphQL, and modern frontend tools.`,
        requirements: [
            '5+ years of experience with React and modern JavaScript',
            'Strong TypeScript and state management skills',
            'Experience with GraphQL and REST APIs',
            'History of mentoring junior developers',
            'Excellent communication and collaboration skills'
        ],
        salary: {
            min: '120000',
            max: '180000',
            currency: 'USD',
            period: 'year'
        },
        employmentType: 'full-time',
        experienceLevel: 'senior',
        benefits: [
            'Health, Dental & Vision Insurance',
            'Unlimited PTO',
            '401(k) with Company Match',
            'Remote Work Options',
            'Professional Development Budget',
            'Home Office Stipend'
        ]
    };
};

export const suggestSkillsAndRequirements = async (text: string) => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // For demo, always return developer skills
    return mockSkills.developer;
};

// Function to match candidates with job requirements
export async function matchCandidateToJob(
    candidateSkills: string[],
    jobRequirements: string[]
): Promise<number> {
    // TODO: Replace with actual AI-powered matching
    // This is a mock implementation

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simple matching algorithm (replace with AI service)
    const normalizedSkills = candidateSkills.map(skill => skill.toLowerCase());
    const normalizedRequirements = jobRequirements.map(req => req.toLowerCase());

    let matches = 0;
    for (const req of normalizedRequirements) {
        if (normalizedSkills.some(skill => req.includes(skill) || skill.includes(req))) {
            matches++;
        }
    }

    return Math.round((matches / jobRequirements.length) * 100);
}

// Function to suggest improvements for job descriptions
export async function suggestJobDescriptionImprovements(
    jobDescription: string
): Promise<string[]> {
    // TODO: Replace with actual AI suggestions
    // This is a mock implementation

    await new Promise(resolve => setTimeout(resolve, 1500));

    const suggestions: string[] = [];

    if (!jobDescription.toLowerCase().includes('requirements')) {
        suggestions.push('Add a clear "Requirements" section');
    }

    if (!jobDescription.toLowerCase().includes('responsibilities')) {
        suggestions.push('Add a "Responsibilities" section');
    }

    if (jobDescription.length < 200) {
        suggestions.push('Consider adding more details to the job description');
    }

    if (!jobDescription.toLowerCase().includes('experience')) {
        suggestions.push('Specify required years of experience');
    }

    return suggestions.length > 0 ? suggestions : ['No specific improvements suggested'];
} 