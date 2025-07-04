
import { create } from 'zustand';

interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  description: string;
}

interface Position {
  id: string;
  title: string;
  department: string;
  location: string;
  description: string;
  requirements: string[];
}

interface Candidate {
  id: string;
  name: string;
  position: string;
  skills: string[];
  experience: string[];
  education: string[];
  score: number;
  status?: 'new' | 'screened' | 'shortlisted' | 'interviewed' | 'rejected';
  eventId?: string;
  positionId?: string;
  interviewScore?: number;
  interviewNotes?: string;
}

interface RecruitmentStore {
  // State
  events: Event[];
  positions: Position[];
  candidates: Candidate[];
  activeEventId: string | null;
  activePositionId: string | null;
  
  // Actions
  setActiveEvent: (id: string | null) => void;
  setActivePosition: (id: string | null) => void;
  addEvent: (event: Event) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  removeEvent: (id: string) => void;
  addPosition: (position: Position) => void;
  updatePosition: (id: string, position: Partial<Position>) => void;
  removePosition: (id: string) => void;
  addCandidate: (candidate: Candidate) => void;
  updateCandidate: (id: string, candidate: Partial<Candidate>) => void;
  removeCandidate: (id: string) => void;
}

// Mock data for initial store state
const mockEvents: Event[] = [
  {
    id: '1',
    name: 'UPM Career Fair 2025',
    date: '2025-05-25',
    location: 'University of Professional Management',
    description: 'Annual career fair targeting graduating students',
  },
  {
    id: '2',
    name: 'Tech Recruit Summit',
    date: '2025-05-27',
    location: 'Tech Conference Center',
    description: 'Industry event for experienced tech professionals',
  },
  {
    id: '3',
    name: 'Engineering Talent Day',
    date: '2025-06-10',
    location: 'Engineering Institute',
    description: 'Specialized event for engineering roles',
  },
];

const mockPositions: Position[] = [
  {
    id: '1',
    title: 'Frontend Developer',
    department: 'Engineering',
    location: 'Hybrid - New York',
    description: 'We are looking for a skilled Frontend Developer with experience in React, TypeScript, and modern CSS frameworks like Tailwind.',
    requirements: [
      'Strong proficiency in React and TypeScript',
      'Experience with state management libraries',
      'Knowledge of modern CSS and responsive design principles',
      'Understanding of web performance optimization',
      'Experience with testing frameworks',
    ],
  },
  {
    id: '2',
    title: 'UX Designer',
    department: 'Design',
    location: 'Remote',
    description: 'We are seeking a talented UX Designer to create exceptional user experiences for our digital products.',
    requirements: [
      'Portfolio demonstrating strong UX/UI design skills',
      'Proficiency in design tools like Figma or Sketch',
      'Experience conducting user research and usability testing',
      'Understanding of accessibility standards',
      'Knowledge of design systems and component libraries',
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

const mockCandidates: Candidate[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    position: 'Frontend Developer',
    skills: ["React", "TypeScript", "Node.js", "CSS"],
    experience: [
      "Senior Frontend Developer at TechCorp (3 years)",
      "Web Developer at StartupXYZ (2 years)"
    ],
    education: ["B.S. Computer Science, State University (2019)"],
    score: 85,
    status: 'shortlisted',
    eventId: '1',
    positionId: '1',
    interviewScore: 87,
    interviewNotes: 'Strong technical skills, excellent cultural fit.'
  },
  {
    id: '2',
    name: 'Sam Taylor',
    position: 'UX Designer',
    skills: ["Figma", "UI Design", "User Research", "HTML/CSS"],
    experience: [
      "UX Designer at DesignCo (2 years)",
      "UI Designer at CreativeLabs (1 year)"
    ],
    education: ["B.F.A. Design, Art Institute (2020)"],
    score: 78,
    status: 'shortlisted',
    eventId: '1',
    positionId: '2',
    interviewScore: 82,
    interviewNotes: 'Great portfolio, good communication skills.'
  },
  {
    id: '3',
    name: 'Morgan Smith',
    position: 'Backend Developer',
    skills: ["Node.js", "Express", "MongoDB", "AWS"],
    experience: [
      "Junior Backend Developer at TechStart (1 year)"
    ],
    education: ["B.S. Computer Engineering, Tech University (2022)"],
    score: 68,
    status: 'interviewed',
    eventId: '2',
    positionId: '3',
    interviewScore: 73,
    interviewNotes: 'Good technical knowledge but limited experience.'
  },
];

const useRecruitmentStore = create<RecruitmentStore>((set) => ({
  events: mockEvents,
  positions: mockPositions,
  candidates: mockCandidates,
  activeEventId: null,
  activePositionId: null,
  
  setActiveEvent: (id) => set({ activeEventId: id }),
  setActivePosition: (id) => set({ activePositionId: id }),
  
  addEvent: (event) => set((state) => ({ 
    events: [...state.events, event] 
  })),
  
  updateEvent: (id, updatedEvent) => set((state) => ({ 
    events: state.events.map(event => 
      event.id === id ? { ...event, ...updatedEvent } : event
    ) 
  })),
  
  removeEvent: (id) => set((state) => ({ 
    events: state.events.filter(event => event.id !== id) 
  })),
  
  addPosition: (position) => set((state) => ({ 
    positions: [...state.positions, position] 
  })),
  
  updatePosition: (id, updatedPosition) => set((state) => ({ 
    positions: state.positions.map(position => 
      position.id === id ? { ...position, ...updatedPosition } : position
    ) 
  })),
  
  removePosition: (id) => set((state) => ({ 
    positions: state.positions.filter(position => position.id !== id) 
  })),
  
  addCandidate: (candidate) => set((state) => ({ 
    candidates: [...state.candidates, candidate] 
  })),
  
  updateCandidate: (id, updatedCandidate) => set((state) => ({ 
    candidates: state.candidates.map(candidate => 
      candidate.id === id ? { ...candidate, ...updatedCandidate } : candidate
    ) 
  })),
  
  removeCandidate: (id) => set((state) => ({ 
    candidates: state.candidates.filter(candidate => candidate.id !== id) 
  })),
}));

export default useRecruitmentStore;
