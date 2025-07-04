import { API_BASE_URL } from './config';

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
    } | null;
    employmentType: string;
    experienceLevel: string;
    benefits: string[];
}

export const extractJobDetails = async (text: string): Promise<JobDetails> => {
    try {
        const response = await fetch(`${API_BASE_URL}/ai/extract-job-details/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text })
        });

        if (!response.ok) {
            throw new Error(`Failed to extract job details: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error extracting job details:', error);

        // Fallback to basic extraction if AI fails
        return {
            title: extractTitle(text) || 'Job Opening',
            department: extractDepartment(text) || 'General',
            location: extractLocation(text) || 'Not specified',
            description: text.length > 500 ? text.substring(0, 500) + '...' : text,
            requirements: extractRequirements(text),
            salary: extractSalary(text),
            employmentType: extractEmploymentType(text) || 'full-time',
            experienceLevel: extractExperienceLevel(text) || 'mid-level',
            benefits: extractBenefits(text)
        };
    }
};

export const suggestSkillsAndRequirements = async (text: string): Promise<string[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/ai/suggest-skills/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text })
        });

        if (!response.ok) {
            throw new Error(`Failed to suggest skills: ${response.statusText}`);
        }

        const data = await response.json();
        return data.skills || [];
    } catch (error) {
        console.error('Error suggesting skills:', error);

        // Fallback skills based on text analysis
        return extractSkillsFromText(text);
    }
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

// Fallback extraction functions for when AI is unavailable
function extractTitle(text: string): string | null {
    const lines = text.split('\n');
    const firstLine = lines[0]?.trim();

    if (firstLine && firstLine.length < 100) {
        return firstLine;
    }

    // Look for common title patterns
    const titlePatterns = [
        /(?:job title|position|role):\s*(.+)/i,
        /hiring\s+(?:a\s+)?(.+?)(?:\s|$)/i,
        /seeking\s+(?:a\s+)?(.+?)(?:\s|$)/i
    ];

    for (const pattern of titlePatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            return match[1].trim();
        }
    }

    return null;
}

function extractDepartment(text: string): string | null {
    const deptPatterns = [
        /department:\s*(.+)/i,
        /team:\s*(.+)/i,
        /division:\s*(.+)/i
    ];

    for (const pattern of deptPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            return match[1].trim();
        }
    }

    // Common department keywords
    const departments = ['engineering', 'marketing', 'sales', 'design', 'product', 'finance', 'hr', 'operations'];
    const lowerText = text.toLowerCase();

    for (const dept of departments) {
        if (lowerText.includes(dept)) {
            return dept.charAt(0).toUpperCase() + dept.slice(1);
        }
    }

    return null;
}

function extractLocation(text: string): string | null {
    const locationPatterns = [
        /location:\s*(.+)/i,
        /based in:\s*(.+)/i,
        /office:\s*(.+)/i
    ];

    for (const pattern of locationPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            return match[1].trim();
        }
    }

    // Check for remote/hybrid keywords
    if (/remote/i.test(text)) return 'Remote';
    if (/hybrid/i.test(text)) return 'Hybrid';

    return null;
}

function extractRequirements(text: string): string[] {
    const requirements: string[] = [];

    // Look for bullet points or numbered lists
    const bulletMatches = text.match(/[•▪▫▬\-\*]\s*(.+)/g);
    if (bulletMatches) {
        requirements.push(...bulletMatches.map(match => match.replace(/^[•▪▫▬\-\*]\s*/, '').trim()));
    }

    // Look for requirement sections
    const reqSectionMatch = text.match(/(?:requirements?|qualifications?|skills?):\s*([\s\S]*?)(?:\n\n|\n[A-Z]|$)/i);
    if (reqSectionMatch && reqSectionMatch[1]) {
        const reqText = reqSectionMatch[1];
        const reqLines = reqText.split('\n').filter(line => line.trim().length > 0);
        requirements.push(...reqLines.map(line => line.trim()));
    }

    return requirements.slice(0, 10); // Limit to 10 requirements
}

function extractSalary(text: string): { min: string; max: string; currency: string; period: string } | null {
    const salaryPatterns = [
        /\$(\d+(?:,\d+)*(?:k)?)\s*[-–]\s*\$?(\d+(?:,\d+)*(?:k)?)/i,
        /(\d+(?:,\d+)*(?:k)?)\s*[-–]\s*(\d+(?:,\d+)*(?:k)?)\s*(?:USD|dollars?)/i
    ];

    for (const pattern of salaryPatterns) {
        const match = text.match(pattern);
        if (match && match[1] && match[2]) {
            let min = match[1].replace(/[k,]/gi, '');
            let max = match[2].replace(/[k,]/gi, '');

            // Handle 'k' suffix
            if (match[1].toLowerCase().includes('k')) {
                min = (parseInt(min) * 1000).toString();
            }
            if (match[2].toLowerCase().includes('k')) {
                max = (parseInt(max) * 1000).toString();
            }

            return {
                min,
                max,
                currency: 'USD',
                period: text.toLowerCase().includes('hourly') || text.toLowerCase().includes('hour') ? 'hour' : 'year'
            };
        }
    }

    return null;
}

function extractEmploymentType(text: string): string | null {
    const types = ['full-time', 'part-time', 'contract', 'internship', 'temporary'];
    const lowerText = text.toLowerCase();

    for (const type of types) {
        if (lowerText.includes(type.replace('-', '[ -]'))) {
            return type;
        }
    }

    return null;
}

function extractExperienceLevel(text: string): string | null {
    if (/senior|lead|principal|staff/i.test(text)) return 'senior';
    if (/junior|entry|graduate|intern/i.test(text)) return 'entry-level';
    if (/mid|intermediate|experienced/i.test(text)) return 'mid-level';
    if (/executive|director|vp|c-level/i.test(text)) return 'executive';

    // Check for years of experience
    const yearsMatch = text.match(/(\d+)\+?\s*years?/i);
    if (yearsMatch) {
        const years = parseInt(yearsMatch[1]);
        if (years <= 2) return 'entry-level';
        if (years <= 5) return 'mid-level';
        return 'senior';
    }

    return null;
}

function extractBenefits(text: string): string[] {
    const commonBenefits = [
        'health insurance', 'dental insurance', 'vision insurance',
        '401k', 'retirement', 'pto', 'vacation', 'sick leave',
        'remote work', 'flexible hours', 'work from home',
        'health insurance', 'life insurance', 'disability insurance',
        'stock options', 'equity', 'bonus', 'commission'
    ];

    const benefits: string[] = [];
    const lowerText = text.toLowerCase();

    for (const benefit of commonBenefits) {
        if (lowerText.includes(benefit)) {
            benefits.push(benefit.split(' ').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' '));
        }
    }

    return [...new Set(benefits)]; // Remove duplicates
}

function extractSkillsFromText(text: string): string[] {
    const commonSkills = [
        'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue', 'Node.js',
        'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
        'HTML', 'CSS', 'SASS', 'Bootstrap', 'Tailwind',
        'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
        'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes',
        'Git', 'GitHub', 'GitLab', 'Jira', 'Slack',
        'Communication', 'Problem Solving', 'Team Collaboration',
        'Project Management', 'Leadership', 'Analytical Thinking'
    ];

    const foundSkills: string[] = [];
    const lowerText = text.toLowerCase();

    for (const skill of commonSkills) {
        if (lowerText.includes(skill.toLowerCase())) {
            foundSkills.push(skill);
        }
    }

    // Add some default soft skills if none found
    if (foundSkills.length === 0) {
        foundSkills.push('Communication', 'Problem Solving', 'Team Collaboration', 'Time Management');
    }

    return foundSkills.slice(0, 12); // Limit to 12 skills
} 