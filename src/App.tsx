import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import { HomePage } from './presentation/pages/Home.page'
import { EventsPage } from './presentation/pages/Events.page'
import { EventDetailPage } from './presentation/pages/EventDetail.page'
import { CheckoutPage } from './presentation/pages/Checkout.page'
import { CreateEventPage } from './presentation/pages/CreateEvent.page'
import { EditEventPage } from './presentation/pages/EditEvent.page'
import { MyEventsPage } from './presentation/pages/MyEvents.page'
import { LoginPage } from './presentation/pages/Login.page'
import { RegisterPage } from './presentation/pages/Register.page'
import { DashboardPage } from './presentation/pages/Dashboard.page'
import { MyTicketsPage } from './presentation/pages/MyTickets.page'
import { AdminDashboardPage } from './presentation/pages/AdminDashboard.page'
import { ManageUsersPage } from './presentation/pages/ManageUsers.page'
import { ArtistsPage } from './presentation/pages/Artists.page'
import { CreateArtistPage } from './presentation/pages/CreateArtist.page'
import { ArtistDetailPage } from './presentation/pages/ArtistDetail.page'
import { EditArtistPage } from './presentation/pages/EditArtist.page'
import { EventProductsPage } from './presentation/pages/EventProducts.page'
import { CreateProductPage } from './presentation/pages/CreateProduct.page'
import { EditProductPage } from './presentation/pages/EditProduct.page'
import { PurchaseHistoryPage } from './presentation/pages/PurchaseHistory.page'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
                  <Route path="/events" element={<EventsPage />} />
                  <Route path="/events/:id" element={<EventDetailPage />} />
                  <Route path="/checkout" element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/events/create" element={
                    <ProtectedRoute>
                      <CreateEventPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/events/:id/edit" element={
                    <ProtectedRoute>
                      <EditEventPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/my-events" element={
                    <ProtectedRoute>
                      <MyEventsPage />
                    </ProtectedRoute>
                  } />
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
          <Route path="/purchase-history" element={
            <ProtectedRoute>
              <PurchaseHistoryPage />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute requiredRole="ADMIN">
              <ManageUsersPage />
            </ProtectedRoute>
          } />
          <Route path="/artists" element={<ArtistsPage />} />
          <Route path="/artists/create" element={
            <ProtectedRoute requiredRole="ADMIN">
              <CreateArtistPage />
            </ProtectedRoute>
          } />
          <Route path="/artists/:id/edit" element={
            <ProtectedRoute requiredRole="ADMIN">
              <EditArtistPage />
            </ProtectedRoute>
          } />
          <Route path="/artists/:id" element={<ArtistDetailPage />} />
          <Route path="/events/:eventId/products" element={<EventProductsPage />} />
          <Route path="/events/:eventId/products/new" element={
            <ProtectedRoute>
              <CreateProductPage />
            </ProtectedRoute>
          } />
          <Route path="/events/:eventId/products/:id/edit" element={
            <ProtectedRoute>
              <EditProductPage />
            </ProtectedRoute>
          } />
        </Routes>
      </Layout>
    </AuthProvider>
  )
}

export default App
