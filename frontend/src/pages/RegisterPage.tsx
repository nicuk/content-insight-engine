import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import './AuthPages.css';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    // Password match validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Password strength validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.register(email, password);
      
      // Store token in localStorage
      localStorage.setItem('token', response.token);
      
      // Redirect to home page
      navigate('/');
      
      // Reload the page to update the navbar state
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <h1 className="text-center mb-4">Create Account</h1>
        
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary auth-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
      
      <div className="auth-info">
        <h2>Join Content Insight Engine</h2>
        <p>
          Create a free account to unlock the full potential of our AI-powered content analysis tools.
        </p>
        <p>
          With your account, you'll be able to:
        </p>
        <ul>
          <li>Save and organize your content analyses</li>
          <li>Track content insights over time</li>
          <li>Export summaries and keywords</li>
          <li>Access premium AI features</li>
        </ul>
      </div>
    </div>
  );
};

export default RegisterPage;
