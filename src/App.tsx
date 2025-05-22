import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";

// Lazy load all pages
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const EventSetup = lazy(() => import("./pages/EventSetup"));
const EventList = lazy(() => import("./pages/EventList"));
const CandidateIntake = lazy(() => import("./pages/CandidateIntake"));
const QRRegistration = lazy(() => import("./pages/QRRegistration"));
const Interview = lazy(() => import("./pages/Interview"));
const InterviewSchedule = lazy(() => import("./pages/InterviewSchedule"));
const FinalReview = lazy(() => import("./pages/FinalReview"));
const CandidateView = lazy(() => import("./pages/CandidateView"));
const JobOpenings = lazy(() => import("./pages/JobOpenings"));
const CandidateComparison = lazy(() => import("./pages/CandidateComparison"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Layout><Index /></Layout>} />
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/events" element={<Layout><EventList /></Layout>} />
            <Route path="/event-setup" element={<Layout><EventSetup /></Layout>} />
            <Route path="/job-openings" element={<Layout><JobOpenings /></Layout>} />
            <Route path="/candidate-intake" element={<Layout><CandidateIntake /></Layout>} />
            <Route path="/candidate-intake/qr-registration/:eventId" element={<Layout><QRRegistration /></Layout>} />
            <Route path="/interview" element={<Layout><Interview /></Layout>} />
            <Route path="/interview/schedule" element={<Layout><InterviewSchedule /></Layout>} />
            <Route path="/interview/schedule/:candidateId" element={<Layout><InterviewSchedule /></Layout>} />
            <Route path="/final-review" element={<Layout><FinalReview /></Layout>} />
            <Route path="/candidate/:candidateId" element={<Layout><CandidateView /></Layout>} />
            <Route path="/candidate-comparison" element={<Layout><CandidateComparison /></Layout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
