import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <div className="hero">
        <h1>AI-Powered Content Insight Engine</h1>
        <p className="lead">
          Extract valuable insights from any web content using advanced AI technology
        </p>
        <div className="cta-buttons">
          <Link to="/submit" className="btn btn-primary">
            Analyze Content
          </Link>
          <Link to="/register" className="btn btn-secondary">
            Create Account
          </Link>
        </div>
      </div>

      <div className="features">
        <h2 className="text-center mb-4">Key Features</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Smart Content Extraction</h3>
            <p>
              Our advanced algorithm identifies and extracts the main content from any webpage,
              filtering out ads, navigation, and other non-essential elements.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI-Powered Summaries</h3>
            <p>
              Get concise, accurate summaries of lengthy content using Google's
              Gemini AI technology.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔑</div>
            <h3>Keyword Extraction</h3>
            <p>
              Automatically identify and extract the most important keywords and topics
              from any content.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Fast Processing</h3>
            <p>
              Our asynchronous processing architecture ensures quick results even for
              large content sources.
            </p>
          </div>
        </div>
      </div>

      <div className="how-it-works">
        <h2 className="text-center mb-4">How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Submit URL</h3>
            <p>Enter the URL of any webpage you want to analyze</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>AI Processing</h3>
            <p>Our system extracts and processes the content</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Get Insights</h3>
            <p>View the summary, keywords, and other insights</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
