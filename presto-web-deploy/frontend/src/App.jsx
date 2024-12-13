import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm, RegisterForm } from './features/auth';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { PresentationEditor } from './pages/PresentationEditor';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/presentation/:id"
          element={
            <ProtectedRoute>
              <PresentationEditor />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;