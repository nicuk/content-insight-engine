import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly geminiModel;

  constructor() {
    try {
      const API_KEY = process.env.GEMINI_API_KEY;
      
      this.logger.log('Initializing AI Service');
      
      if (!API_KEY) {
        this.logger.error('GEMINI_API_KEY not found in environment variables');
        throw new Error('GEMINI_API_KEY not found in environment variables');
      }
      
      this.logger.log('API Key found, initializing Gemini model');
      const genAI = new GoogleGenerativeAI(API_KEY);
      
      // Configure the model with safety settings
      this.geminiModel = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
      });
      
      this.logger.log('Gemini model initialized successfully');
    } catch (error) {
      this.logger.error(`Error initializing AI service: ${error.message}`);
      this.logger.error(error.stack);
    }
  }

  async generateSummary(text: string, maxLength: number = 200): Promise<string> {
    try {
      this.logger.log('Generating summary');
      
      if (!this.geminiModel) {
        this.logger.error('Gemini model not initialized');
        return 'Unable to generate summary: AI model not initialized';
      }
      
      // Create a properly formatted prompt
      const prompt = `Summarize the following text in a concise way, keeping the most important information. 
      Keep the summary under ${maxLength} words:
      
      ${text.substring(0, 10000)}`; // Limit text length to avoid token limits
      
      // Generate content
      this.logger.log('Sending request to Gemini API');
      const result = await this.geminiModel.generateContent({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      });
      
      this.logger.log('Received response from Gemini API');
      
      // Extract the response text
      const response = result.response;
      return response.text().trim();
    } catch (error) {
      this.logger.error(`Error generating summary: ${error.message}`);
      this.logger.error(error.stack);
      return `Unable to generate summary: ${error.message}`;
    }
  }

  async extractKeywords(text: string, maxKeywords: number = 10): Promise<string[]> {
    try {
      this.logger.log('Extracting keywords');
      
      if (!this.geminiModel) {
        this.logger.error('Gemini model not initialized');
        return ['Error: AI model not initialized'];
      }
      
      // Create a properly formatted prompt
      const prompt = `Extract the ${maxKeywords} most important keywords or phrases from the following text. 
      Return only the keywords as a comma-separated list, with no additional text:
      
      ${text.substring(0, 10000)}`; // Limit text length to avoid token limits
      
      // Generate content
      this.logger.log('Sending request to Gemini API');
      const result = await this.geminiModel.generateContent({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2, // Lower temperature for more deterministic results
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 256,
        },
      });
      
      this.logger.log('Received response from Gemini API');
      
      // Extract and process the response
      const response = result.response.text().trim();
      return response.split(',').map(keyword => keyword.trim());
    } catch (error) {
      this.logger.error(`Error extracting keywords: ${error.message}`);
      this.logger.error(error.stack);
      return [`Error extracting keywords: ${error.message}`];
    }
  }
}
