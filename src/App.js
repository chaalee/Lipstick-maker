// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Start from './pages/Start';
import SkinToneAnalyzer from './components/SkinToneAnalyzer';
import LipstickPage from './pages/Lipstick';
import Stats from './pages/Stats';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import NavBar from './components/NavBar';

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        {/* Home route redirects to start page */}
        <Route path="/" element={<Start />} />
        
        {/* Analysis route */}
        <Route path="/analyze" element={<SkinToneAnalyzer />} />
        <Route path="/lipstick" element={<LipstickPage />} />
        {/* Stats routes */}
        <Route path="/login" element={<Login />} />
        <Route 
          path="/stats" 
          element={
            <ProtectedRoute>
              <Stats />
            </ProtectedRoute>
          } 
        />

        {/* Catch all route for 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

    </Router>
  );
}

export default App;