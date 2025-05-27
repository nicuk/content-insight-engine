import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import SubmitContentPage from './pages/SubmitContentPage';
import ResultsPage from './pages/ResultsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/submit" element={<SubmitContentPage />} />
            <Route path="/results/:id" element={<ResultsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
