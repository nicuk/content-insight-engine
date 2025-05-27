import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class ContentExtractorService {
  private readonly logger = new Logger(ContentExtractorService.name);

  async extractContent(url: string): Promise<string> {
    try {
      this.logger.log(`Extracting content from URL: ${url}`);
      const html = await this.fetchHtml(url);
      const $ = cheerio.load(html);
      
      // Remove non-content elements
      $('nav, header, footer, aside, script, style, iframe').remove();
      
      // Extract main content (simplified version)
      const mainContent = $('article, main, .content, #content').text().trim();
      
      // If no main content found, get body text
      const content = mainContent || $('body').text().trim();
      
      return content;
    } catch (error) {
      this.logger.error(`Error extracting content: ${error.message}`);
      throw new Error(`Failed to extract content: ${error.message}`);
    }
  }

  private async fetchHtml(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        timeout: 10000,
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Error fetching URL ${url}: ${error.message}`);
      throw new Error(`Failed to fetch URL: ${error.message}`);
    }
  }
}
