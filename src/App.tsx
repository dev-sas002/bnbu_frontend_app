import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import UpdatePassword from './pages/UpdatePassword';
import PrivateRoute from './components/PrivateRoute'
import LeaseManagement from './pages/LeaseManagement';
import LeaseDetail from './pages/LeaseDetail';
import DocumentPreview from './pages/DocumentPreview';
import ViewNotes from './pages/ViewNotes'
import './App.css'
import Layout from './components/Layout';
import RegulationManagement from './pages/RegulationManagement';
import RegulationDetail from './pages/RegulationDetail';
import ViewRegulationChat from './pages/ViewRegulationChat';
import RentalManagement from './pages/RentalManagement';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route path="/update-password/:id" element={<UpdatePassword />} />
      <Route
        path="/leases"
        element={
          <PrivateRoute>
            <LeaseManagement />
          </PrivateRoute>
        }
      />
      <Route
        path="/lease/:id"
        element={
          <PrivateRoute>
            <LeaseDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/preview/:documentId"
        element={
          <PrivateRoute>
            <Layout>
            <DocumentPreview />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/lease/:id/documents/:documentId/notes"  // Updated route for ViewNotes using documentId
        element={
          <PrivateRoute>
            <ViewNotes />
          </PrivateRoute>
        }
      />
      <Route
        path="/regulations"
        element={
          <PrivateRoute>
            <RegulationManagement />  {/* Added Regulation Management Route */}
          </PrivateRoute>
        }
      />
      <Route
        path="/regulation/:id"
        element={
          <PrivateRoute>
            <RegulationDetail />  {/* Added Regulation Detail Route */}
          </PrivateRoute>
        }
      />
      <Route
        path="/regulation/:regulationId/chat"
        element={
          <PrivateRoute>
            <ViewRegulationChat />  {/* Updated Regulation Chat Route */}
          </PrivateRoute>
        }
      />
      <Route path="/rental-analyzer" element={
          <PrivateRoute>
            <RentalManagement /> 
          </PrivateRoute>
        } 
      />

    </Routes>
  )
}

export default App