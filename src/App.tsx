
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Layout from '@/components/layout/Layout';
import Interview from '@/pages/Interview';
import CandidateIntake from '@/pages/CandidateIntake';
import QRRegistration from '@/pages/QRRegistration';
import EventSetup from '@/pages/EventSetup';
import EventList from '@/pages/EventList';
import EventDashboard from '@/pages/EventDashboard';
import JobOpenings from '@/pages/JobOpenings';
import FinalReview from '@/pages/FinalReview';
import CandidateComparison from '@/pages/CandidateComparison';
import CandidateView from '@/pages/CandidateView';
import Settings from '@/pages/Settings';
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/NotFound';
import { UserRoleProvider } from "@/contexts/UserRoleContext";
import { NavigationProvider } from "@/contexts/NavigationContext";
import { RecruitmentContextProvider } from "@/contexts/RecruitmentContext";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <UserRoleProvider>
            <NavigationProvider>
              <RecruitmentContextProvider>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route element={<Layout />}>
                    {/* Overview Routes */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/job-openings" element={<JobOpenings />} />
                    <Route path="/events" element={<EventList />} />
                    <Route path="/event-setup" element={<EventSetup />} />
                    <Route path="/event-dashboard/:eventId" element={<EventDashboard />} />

                    {/* Recruitment Pipeline Routes */}
                    <Route path="/applied" element={<CandidateIntake />} />
                    <Route path="/screened" element={<CandidateComparison />} />
                    <Route path="/interviewed" element={<Interview />} />
                    <Route path="/final-review" element={<FinalReview />} />
                    <Route path="/hired" element={<CandidateView />} />
                    <Route path="/candidate-comparison" element={<CandidateComparison />} />

                    {/* Additional Routes */}
                    <Route path="/candidate/:candidateId" element={<CandidateView />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/profile" element={<Settings />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
                <Toaster />
                <Sonner />
              </RecruitmentContextProvider>
            </NavigationProvider>
          </UserRoleProvider>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
