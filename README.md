# AI-Powered Content Insight Engine

A full-stack application that provides AI-generated insights about textual content, built with NestJS (backend) and React (frontend).

## Project Overview

This application allows authenticated users to submit textual content (either directly or via URL) and receive AI-generated insights including:
- Content summarization
- Keyword extraction

The system features:
- Custom URL content extraction using sophisticated heuristics
- Asynchronous processing pipeline for AI analysis
- JWT-based authentication
- Clean, intuitive UI for content submission and results viewing

## Technical Architecture

### Backend (NestJS)
- **Authentication Module**: JWT-based auth with simplified implementation
- **Content Module**: Core functionality for content submission and extraction
- **Processing Module**: Asynchronous AI processing with event-based architecture
- **Database**: SQLite with TypeORM for rapid development and easy setup

### Frontend (React)
- **Authentication**: Login/register forms with JWT storage
- **Content Submission**: Text input and URL submission forms
- **Results Dashboard**: Display of processing status and AI insights

### Key Components

#### Custom URL Content Extractor
The application features a sophisticated custom URL content extractor that uses multiple heuristics to identify and extract the main content from web pages:

1. **Text Density Analysis**: Identifies content-rich blocks based on text-to-HTML ratio
2. **Link Density Filtering**: Excludes navigation-heavy sections with high link concentration
3. **Heading Proximity Scoring**: Weights content based on relationship to headings
4. **Boilerplate Detection**: Identifies and removes common non-content elements
5. **Position Scoring**: Applies weights based on typical content positioning patterns
6. **Sentence Structure Analysis**: Evaluates text quality based on sentence patterns

#### AI Processing Pipeline
The asynchronous processing pipeline implements:
1. Event-based architecture for non-blocking operations
2. Status tracking throughout the processing lifecycle
3. Parallel execution of multiple AI analysis tasks
4. Comprehensive error handling and recovery

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- npm or yarn

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys and configuration

# Run development server
npm run start:dev
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your backend URL

# Run development server
npm start
```

### Database Setup
The application uses SQLite by default, which requires no additional setup. The database file will be created automatically when you run the backend.

## API Documentation

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Log in and receive JWT token

### Content
- `POST /content` - Submit new content (text or URL)
- `GET /content` - Get list of user's content items
- `GET /content/:id` - Get specific content item with insights

## Future Improvements
With additional time, the following enhancements would be implemented:
- Support for additional document types beyond plain text and web pages
- More AI insight types (sentiment analysis, topic classification)
- Enhanced content extraction for complex page layouts
- User-configurable insight preferences
- Batch processing capabilities

## Technical Choices

### Why SQLite + TypeORM
For rapid development and easy setup, SQLite provides a zero-configuration database that still allows proper demonstration of database design and ORM usage. In a production environment, this would be replaced with PostgreSQL or another robust database.

### Why Gemini for Summarization
Gemini's models provide high-quality text summarization with minimal configuration and is free, allowing the focus to remain on the application architecture rather than AI model training.

### Why Custom Keyword Extraction
Implementing a custom TF-IDF based keyword extraction algorithm demonstrates algorithmic thinking while avoiding additional API dependencies.
