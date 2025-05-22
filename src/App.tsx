
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import EventSetup from "./pages/EventSetup";
import CandidateIntake from "./pages/CandidateIntake";
import QRRegistration from "./pages/QRRegistration";
import Interview from "./pages/Interview";
import InterviewSchedule from "./pages/InterviewSchedule";
import FinalReview from "./pages/FinalReview";
import CandidateView from "./pages/CandidateView";
import Layout from "./components/layout/Layout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Index /></Layout>} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/event-setup" element={<Layout><EventSetup /></Layout>} />
          <Route path="/candidate-intake" element={<Layout><CandidateIntake /></Layout>} />
          <Route path="/candidate-intake/qr-registration" element={<Layout><QRRegistration /></Layout>} />
          <Route path="/interview" element={<Layout><Interview /></Layout>} />
          <Route path="/interview/schedule" element={<Layout><InterviewSchedule /></Layout>} />
          <Route path="/interview/schedule/:candidateId" element={<Layout><InterviewSchedule /></Layout>} />
          <Route path="/final-review" element={<Layout><FinalReview /></Layout>} />
          <Route path="/candidate/:candidateId" element={<Layout><CandidateView /></Layout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
