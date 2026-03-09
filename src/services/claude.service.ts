import Groq from 'groq-sdk';
import { config } from '../config';
import { logger } from '../utils/logger';

const SYSTEM_PROMPT = `You are Elenos Bot, the official assistant for Elenos Software Agency.
Elenos is a cutting-edge software agency that builds high-quality web apps, mobile apps, and AI-powered systems.
You are knowledgeable, professional, and slightly witty. Keep responses concise and Discord-friendly (under 1800 characters).
When discussing tech news or topics, always be insightful and add value beyond surface-level summaries.`;

const log = logger.child({ service: 'AIService' });

export class ClaudeService {
  private client: Groq;

  constructor() {
    this.client = new Groq({ apiKey: config.anthropic.apiKey });
  }

  async generateResponse(userPrompt: string, systemOverride?: string): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: config.anthropic.model,
        max_tokens: config.anthropic.maxTokens,
        messages: [
          { role: 'system', content: systemOverride ?? SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
      });

      const text = response.choices[0]?.message?.content;
      if (!text) return 'I had trouble generating a response. Please try again.';

      return text.slice(0, 1900);
    } catch (err) {
      log.error({ err }, 'AI generateResponse failed');
      return 'I ran into an issue processing that. Please try again shortly.';
    }
  }

  async summarizeArticle(title: string, url: string, snippet: string): Promise<string> {
    const prompt = `Summarize this tech article for a Discord community in exactly 3 bullet points. Be concise and insightful.

Title: ${title}
URL: ${url}
Snippet: ${snippet}

Format:
• [key point 1]
• [key point 2]
• [key point 3]`;

    return this.generateResponse(prompt, SYSTEM_PROMPT);
  }

  async brainstorm(topic: string): Promise<string> {
    const prompt = `Generate 5 creative and practical ideas related to: "${topic}"
Format as a numbered list. Each idea should be 1-2 sentences. Focus on software/tech angles where relevant.`;

    return this.generateResponse(prompt, SYSTEM_PROMPT);
  }

  async generateWeeklyDigest(articles: Array<{ title: string; url: string }>): Promise<string> {
    const articleList = articles.map((a, i) => `${i + 1}. ${a.title} (${a.url})`).join('\n');
    const prompt = `Write a "Week in Tech" digest paragraph for a Discord server based on these articles from the past 7 days.
Make it engaging, highlight the biggest themes, and keep it under 400 words.

Articles:
${articleList}`;

    return this.generateResponse(prompt, SYSTEM_PROMPT);
  }
}

export const claudeService = new ClaudeService();
