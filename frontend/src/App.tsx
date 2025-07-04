import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Layout from '@/components/layout/Layout';
import Interview from '@/pages/Interview';
import InterviewLobby from '@/pages/InterviewLobby';
import InterviewedCandidates from '@/pages/InterviewedCandidates';
import InterviewReport from '@/pages/InterviewReport';
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
import { NewJobOpening } from '@/pages/NewJobOpening';
import EventCreation from '@/pages/EventCreation';
import EventOps from '@/pages/EventOps';
import FastCheckIn from '@/components/event/FastCheckIn';
import QRRegistrationDisplay from '@/components/event/QRRegistration';
import CandidateRegistration from '@/pages/CandidateRegistration';
import RegistrationSuccess from '@/pages/RegistrationSuccess';

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
                  {/* Public registration routes - outside of Layout */}
                  <Route path="/register/:eventId" element={<CandidateRegistration />} />
                  <Route path="/registration-success/:eventId" element={<RegistrationSuccess />} />

                  <Route path="/" element={<Layout />}>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="events" element={<EventList />} />
                    <Route path="event-setup" element={<EventSetup />} />
                    {/* Redirect for common misspelling */}
                    <Route path="event/setup" element={<Navigate to="/event-setup" replace />} />
                    <Route path="event-creation" element={<EventCreation />} />
                    <Route path="event-operations" element={<EventOps />} />
                    <Route path="fast-checkin" element={<FastCheckIn />} />
                    <Route path="event-dashboard/:id" element={<EventDashboard />} />
                    <Route path="job-openings">
                      <Route index element={<JobOpenings />} />
                      <Route path="new" element={<NewJobOpening />} />
                    </Route>
                    <Route path="candidate-intake" element={<CandidateIntake />} />
                    <Route path="qr-registration" element={<QRRegistrationDisplay />} />
                    <Route path="applied" element={<AppliedCandidates />} />
                    <Route path="screened" element={<Screening />} />
                    <Route path="interviewed" element={<InterviewedCandidates />} />
                    <Route path="interview">
                      <Route index element={<InterviewLobby />} />
                      <Route path="new" element={<Interview />} />
                      <Route path=":id" element={<Interview />} />
                      <Route path=":id/report" element={<InterviewReport />} />
                    </Route>
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
