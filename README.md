# # Content Insight Engine

An AI-powered application that extracts and analyzes content from any URL, providing summaries, keywords, and insights.

## Features

- **Content Extraction**: Automatically extracts main content from any URL, filtering out navigation, ads, and other non-content elements
- **AI-Powered Analysis**: Leverages Google's Gemini 1.5 Flash model to generate concise summaries and extract relevant keywords
- **Clean Web Interface**: Simple, responsive UI for submitting URLs and viewing analysis results
- **Modular Architecture**: Built with NestJS for maintainability and scalability

## Tech Stack

- **Backend**: NestJS with TypeScript
- **Content Extraction**: Cheerio for HTML parsing and content identification
- **AI Integration**: Google Gemini API for content analysis
- **Frontend**: HTML/CSS/JavaScript with responsive design

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the project root with your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   JWT_SECRET=your_secret_here
   ```
4. Build the application:
   ```
   npm run build
   ```
5. Start the application:
   ```
   npm start
   ```
6. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

- `GET /content/test` - Test if the service is running
- `POST /content/extract` - Extract content from a URL
  - Body: `{ "url": "https://example.com" }`
- `POST /content/analyze` - Extract and analyze content from a URL
  - Body: `{ "url": "https://example.com" }`
  - Returns: Summary, keywords, and content preview

## Future Enhancements

- Database integration for storing analyzed content
- User authentication and saved analyses
- Additional AI analysis features (sentiment analysis, topic classification)
- Comparison of multiple URLs

## License

MIT
