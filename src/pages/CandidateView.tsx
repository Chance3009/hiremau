import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileText, User, ChevronLeft, Brain, MessageSquare } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import ResumeSummary from '@/components/candidate/ResumeSummary';
import AIAnalysis from '@/components/interview/AIAnalysis';
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { useRecruitment } from "@/contexts/RecruitmentContext";

const CandidateView = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const { setCurrentStage } = useRecruitment();
  const [activeTab, setActiveTab] = useState('resume');

  // Mock candidate data - in a real app, this would come from an API call
  const candidate = {
    id: candidateId || '1',
    name: 'Alex Johnson',
    position: 'Frontend Developer',
    status: 'shortlist',
    event: 'UPM Career Fair 2025',
    score: 85,
    skills: ["React", "TypeScript", "CSS", "Node.js", "Git"],
    experience: [
      "Senior Frontend Developer at TechCorp (3 years)",
      "Web Developer at StartupXYZ (2 years)"
    ],
    education: ["B.S. Computer Science, State University (2019)"],
    isAIGenerated: true
  };

  // Mock AI analysis data
  const mockAIAnalysis = {
    authenticity: {
      score: 92,
      summary: "High confidence in profile authenticity. Experience and education verified through multiple sources.",
      details: {
        experience: "Verified through LinkedIn, company websites, and professional networks",
        education: "Degree confirmed with State University",
        references: "2 professional references verified",
        redFlags: "None detected"
      }
    },
    skillMatch: {
      score: 88,
      summary: "Strong match with required technical skills. Expert in React ecosystem and modern frontend development.",
      details: {
        strengths: [
          "Expert in React and TypeScript",
          "Strong CI/CD implementation experience",
          "Proven track record in modern frontend architecture"
        ],
        gaps: [
          "Limited cloud platform experience",
          "No mention of testing frameworks",
          "Could benefit from more backend exposure"
        ],
        recommendations: [
          "Consider pairing with cloud expert",
          "Implement testing requirements in onboarding"
        ]
      }
    },
    culturalFit: {
      score: 85,
      summary: "Good alignment with company values. Shows initiative and values continuous learning.",
      details: {
        strengths: [
          "Demonstrates strong initiative",
          "Values continuous learning",
          "Good team collaboration indicators"
        ],
        concerns: [
          "May need guidance on remote work practices",
          "Limited experience in distributed teams"
        ],
        recommendations: [
          "Include remote work best practices in onboarding",
          "Pair with experienced remote team member"
        ]
      }
    },
    overallRecommendation: {
      summary: "Strong candidate with excellent technical foundation. Recommended for next stage.",
      nextSteps: [
        "Proceed with technical assessment",
        "Schedule team culture interview",
        "Prepare cloud platform training plan"
      ]
    }
  };

  const handleStatusChange = (status: 'shortlist' | 'kiv' | 'reject') => {
    // In a real app, this would update the candidate's status via an API call
    console.log(`Changing status to ${status} for candidate ${candidateId}`);
  };

  const handleNotesChange = (notes: string) => {
    console.log(`Updating notes for candidate ${candidateId}:`, notes);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={candidate.name}
        subtitle={candidate.position}
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleGoBack}>
            Back
          </Button>
          <Button onClick={() => {
            setCurrentStage('interviewed');
            navigate('/interview');
          }}>
            Start Interview
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Candidate Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle>Candidate Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column - Basic Info & Skills */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Profile Match</h3>
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-bold text-blue-600">{candidate.score}%</div>
                      <div className="flex-1">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${candidate.score}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Overall match with job requirements</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Technical Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Experience</h3>
                    <div className="space-y-3">
                      {candidate.experience.map((exp, index) => (
                        <div key={index} className="text-sm">
                          {exp}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column - AI Analysis */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">AI Assessment</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span className="text-sm">Authenticity</span>
                        </div>
                        <span className="text-sm font-semibold text-green-600">{mockAIAnalysis.authenticity.score}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                          <span className="text-sm">Skill Match</span>
                        </div>
                        <span className="text-sm font-semibold text-blue-600">{mockAIAnalysis.skillMatch.score}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                          <span className="text-sm">Cultural Fit</span>
                        </div>
                        <span className="text-sm font-semibold text-purple-600">{mockAIAnalysis.culturalFit.score}%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Key Insights</h3>
                    <div className="space-y-3">
                      <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                        <h4 className="text-xs font-medium text-green-700 mb-1">Strengths</h4>
                        <ul className="text-xs space-y-1">
                          {mockAIAnalysis.skillMatch.details.strengths.slice(0, 2).map((strength, index) => (
                            <li key={index} className="text-green-600">• {strength}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                        <h4 className="text-xs font-medium text-amber-700 mb-1">Areas to Address</h4>
                        <ul className="text-xs space-y-1">
                          {mockAIAnalysis.skillMatch.details.gaps.slice(0, 2).map((gap, index) => (
                            <li key={index} className="text-amber-600">• {gap}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Recommendation</h3>
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                      <p className="text-sm text-blue-600">{mockAIAnalysis.overallRecommendation.summary}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fixed Quick Actions Panel */}
        <div className="col-span-1">
          <div className="sticky top-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" variant="default">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Schedule Interview
                </Button>
                <Button className="w-full" variant="secondary">
                  <FileText className="h-4 w-4 mr-2" />
                  Download Resume
                </Button>
                <Button className="w-full" variant="outline">
                  <User className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recruiter Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="new">New</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notes</label>
                    <textarea
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]"
                      placeholder="Add your notes here..."
                    />
                  </div>
                  <Button className="w-full">Save Notes</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="resume">
            <FileText className="h-4 w-4 mr-2" />
            Full Resume
          </TabsTrigger>
          <TabsTrigger value="ai_analysis">
            <Brain className="h-4 w-4 mr-2" />
            Detailed Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resume" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Full Resume</CardTitle>
              <CardDescription>Complete resume with AI-powered insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Professional Summary */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Professional Summary</h3>
                  <div className="bg-muted/50 p-4 rounded-lg mb-2">
                    <p>Experienced Frontend Developer with 5+ years of expertise in building modern web applications. Strong focus on React ecosystem and TypeScript. Proven track record of delivering high-quality, scalable solutions and mentoring junior developers.</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-700 text-sm mb-1">
                      <Brain className="h-4 w-4" />
                      <span className="font-medium">AI Analysis</span>
                    </div>
                    <p className="text-sm text-blue-600">Strong alignment with role requirements. Notable emphasis on modern frontend technologies and mentorship experience, which matches our team's needs.</p>
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Professional Experience</h3>
                  {candidate.experience.map((exp, index) => (
                    <div key={index} className="mb-6">
                      <div className="bg-muted/50 p-4 rounded-lg mb-2">
                        <h4 className="font-medium">{exp}</h4>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Led frontend development for 3 major projects using React and TypeScript</li>
                          <li>Implemented CI/CD pipelines reducing deployment time by 40%</li>
                          <li>Mentored 4 junior developers and conducted code reviews</li>
                        </ul>
                      </div>
                      <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-700 text-sm mb-1">
                          <Brain className="h-4 w-4" />
                          <span className="font-medium">AI Insights</span>
                        </div>
                        <p className="text-sm text-blue-600">Demonstrates strong leadership and technical expertise. Notable achievements in project delivery and team development.</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Education */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Education</h3>
                  {candidate.education.map((edu, index) => (
                    <div key={index} className="mb-6">
                      <div className="bg-muted/50 p-4 rounded-lg mb-2">
                        <h4 className="font-medium">{edu}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai_analysis" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed AI Analysis</CardTitle>
              <CardDescription>Comprehensive AI-powered assessment and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Authenticity Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Profile Authenticity</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Verification Score</span>
                        <span className="text-lg font-bold text-green-600">{mockAIAnalysis.authenticity.score}%</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{mockAIAnalysis.authenticity.summary}</p>
                    </div>
                    <div className="space-y-3">
                      {Object.entries(mockAIAnalysis.authenticity.details).map(([key, value]) => (
                        <div key={key} className="bg-muted/50 p-3 rounded-lg">
                          <h4 className="text-sm font-medium mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                          <p className="text-sm text-muted-foreground">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Skill Match Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Technical Assessment</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="bg-muted/50 p-4 rounded-lg mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Skill Match Score</span>
                          <span className="text-lg font-bold text-blue-600">{mockAIAnalysis.skillMatch.score}%</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{mockAIAnalysis.skillMatch.summary}</p>
                      </div>
                      <div className="bg-green-50 border border-green-100 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-green-700 mb-2">Key Strengths</h4>
                        <ul className="space-y-2">
                          {mockAIAnalysis.skillMatch.details.strengths.map((strength, index) => (
                            <li key={index} className="text-sm text-green-600">• {strength}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div>
                      <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg mb-4">
                        <h4 className="text-sm font-medium text-amber-700 mb-2">Skill Gaps</h4>
                        <ul className="space-y-2">
                          {mockAIAnalysis.skillMatch.details.gaps.map((gap, index) => (
                            <li key={index} className="text-sm text-amber-600">• {gap}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-700 mb-2">Recommendations</h4>
                        <ul className="space-y-2">
                          {mockAIAnalysis.skillMatch.details.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-blue-600">• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cultural Fit Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Cultural Assessment</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="bg-muted/50 p-4 rounded-lg mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Cultural Fit Score</span>
                          <span className="text-lg font-bold text-purple-600">{mockAIAnalysis.culturalFit.score}%</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{mockAIAnalysis.culturalFit.summary}</p>
                      </div>
                      <div className="bg-green-50 border border-green-100 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-green-700 mb-2">Cultural Strengths</h4>
                        <ul className="space-y-2">
                          {mockAIAnalysis.culturalFit.details.strengths.map((strength, index) => (
                            <li key={index} className="text-sm text-green-600">• {strength}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div>
                      <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg mb-4">
                        <h4 className="text-sm font-medium text-amber-700 mb-2">Areas of Concern</h4>
                        <ul className="space-y-2">
                          {mockAIAnalysis.culturalFit.details.concerns.map((concern, index) => (
                            <li key={index} className="text-sm text-amber-600">• {concern}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-700 mb-2">Recommendations</h4>
                        <ul className="space-y-2">
                          {mockAIAnalysis.culturalFit.details.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-blue-600">• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Next Steps */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                    <p className="text-sm text-blue-600 mb-4">{mockAIAnalysis.overallRecommendation.summary}</p>
                    <div className="space-y-2">
                      {mockAIAnalysis.overallRecommendation.nextSteps.map((step, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                          <span className="text-sm text-blue-600">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CandidateView;
