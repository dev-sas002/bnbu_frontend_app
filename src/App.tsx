import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import UpdatePassword from './pages/UpdatePassword';
import PrivateRoute from './components/PrivateRoute'
import LeaseManagement from './pages/LeaseManagement';
import LeaseDetail from './pages/LeaseDetail';

import './App.css'

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
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
    </Routes>
  )
}

export default App