import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/userContext';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ProjectView from './pages/ProjectView';
import SubProjectView from './pages/SubProjectView';
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <UserProvider>
      <Router future={{ v7_startTransition: true }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/project/:projectId" element={<ProjectView />} />
          <Route path="/project/:projectId/subproject/:subProjectId" element={<SubProjectView />} />
        </Routes>
        <ToastContainer />
      </Router>
    </UserProvider>
  );
}

export default App;