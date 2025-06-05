import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Layout from '@/components/layout/Layout';
import Interview from '@/pages/Interview';
import CandidateIntake from '@/pages/CandidateIntake';
import AppliedCandidates from '@/pages/AppliedCandidates';
import Screening from '@/pages/Screening';
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
import ShortlistedCandidates from '@/pages/ShortlistedCandidates';
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
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="events" element={<EventList />} />
                    <Route path="event-setup" element={<EventSetup />} />
                    <Route path="event-dashboard/:id" element={<EventDashboard />} />
                    <Route path="job-openings" element={<JobOpenings />} />
                    <Route path="candidate-intake" element={<CandidateIntake />} />
                    <Route path="qr-registration" element={<QRRegistration />} />
                    <Route path="applied" element={<AppliedCandidates />} />
                    <Route path="screened" element={<Screening />} />
                    <Route path="interviewed" element={<Interview />} />
                    <Route path="final-review" element={<FinalReview />} />
                    <Route path="shortlisted" element={<ShortlistedCandidates />} />
                    <Route path="candidate/:id" element={<CandidateView />} />
                    <Route path="comparison" element={<CandidateComparison />} />
                    <Route path="settings" element={<Settings />} />
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
