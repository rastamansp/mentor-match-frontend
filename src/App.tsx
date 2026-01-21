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
import SessionDetails from "./presentation/pages/SessionDetails";
import MentorDashboard from "./presentation/pages/MentorDashboard";
import NotFound from "./presentation/pages/NotFound";
import Login from "./presentation/pages/Login";
import TestChatbot from "./presentation/pages/TestChatbot";
import Profile from "./presentation/pages/Profile";
import MyArea from "./presentation/pages/MyArea";
import AdminRegisterUser from "./presentation/pages/AdminRegisterUser";
import AdminUsers from "./presentation/pages/AdminUsers";
import AdminEditUser from "./presentation/pages/AdminEditUser";
import AdminMentors from "./presentation/pages/AdminMentors";
import AdminMentorAvailability from "./presentation/pages/AdminMentorAvailability";
import AdminEditMentor from "./presentation/pages/AdminEditMentor";
import AdminCreateMentor from "./presentation/pages/AdminCreateMentor";

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
            <Route path="/mentors" element={<Mentors />} />
            <Route path="/mentor/:id" element={<MentorProfile />} />
            <Route path="/agendar/:id" element={<Booking />} />
            <Route path="/minhas-sessoes" element={
              <ProtectedRoute>
                <MySessions />
              </ProtectedRoute>
            } />
            <Route path="/sessao/:id" element={
              <ProtectedRoute>
                <SessionDetails />
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
            <Route path="/minha-area" element={
              <ProtectedRoute>
                <MyArea />
              </ProtectedRoute>
            } />
            <Route path="/admin/register-user" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminRegisterUser />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminUsers />
              </ProtectedRoute>
            } />
            <Route path="/admin/users/:id/edit" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminEditUser />
              </ProtectedRoute>
            } />
            <Route path="/admin/mentors" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminMentors />
              </ProtectedRoute>
            } />
            <Route path="/admin/mentors/create" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminCreateMentor />
              </ProtectedRoute>
            } />
            <Route path="/admin/mentors/:id/availability" element={
              <ProtectedRoute>
                <AdminMentorAvailability />
              </ProtectedRoute>
            } />
            <Route path="/admin/mentors/:id/edit" element={
              <ProtectedRoute>
                <AdminEditMentor />
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
