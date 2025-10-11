import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import { HomePage } from './presentation/pages/Home.page'
import { EventsPage } from './presentation/pages/Events.page'
import { EventDetailPage } from './presentation/pages/EventDetail.page'
import { LoginPage } from './presentation/pages/Login.page'
import { RegisterPage } from './presentation/pages/Register.page'
import { DashboardPage } from './presentation/pages/Dashboard.page'
import { MyTicketsPage } from './presentation/pages/MyTickets.page'
import { AdminDashboardPage } from './presentation/pages/AdminDashboard.page'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
                  <Route path="/events" element={<EventsPage />} />
                  <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  } />
          <Route path="/my-tickets" element={
            <ProtectedRoute>
              <MyTicketsPage />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminDashboardPage />
            </ProtectedRoute>
          } />
        </Routes>
      </Layout>
    </AuthProvider>
  )
}

export default App
