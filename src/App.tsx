import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./presentation/pages/Home";
import Mentors from "./presentation/pages/Mentors";
import MentorProfile from "./presentation/pages/MentorProfile";
import Booking from "./presentation/pages/Booking";
import MySessions from "./presentation/pages/MySessions";
import MentorDashboard from "./presentation/pages/MentorDashboard";
import NotFound from "./presentation/pages/NotFound";
import Login from "./presentation/pages/Login";
import Register from "./presentation/pages/Register";
import TestChatbot from "./presentation/pages/TestChatbot";
import Profile from "./presentation/pages/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster /> 
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Register />} />
            <Route path="/register" element={<Register />} />
            <Route path="/mentors" element={<Mentors />} />
            <Route path="/mentor/:id" element={<MentorProfile />} />
            <Route path="/agendar/:id" element={<Booking />} />
            <Route path="/minhas-sessoes" element={
              <ProtectedRoute>
                <MySessions />
              </ProtectedRoute>
            } />
            <Route path="/dashboard-mentor" element={
              <ProtectedRoute>
                <MentorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/testar-chatbot" element={<TestChatbot />} />
            <Route path="/perfil" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
