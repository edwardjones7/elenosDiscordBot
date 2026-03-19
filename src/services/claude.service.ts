import Groq from 'groq-sdk';
import { config } from '../config';
import { logger } from '../utils/logger';

const SYSTEM_PROMPT = `You are Elenos Bot, the official AI assistant for Elenos AI — an AI systems and automation company that builds scalable digital systems, AI operators, and workflow automation tools.
Elenos turns business services into reusable systems, automates them with AI operators, and packages them into digital products.
You are intelligent, professional, and future-focused. Be direct and avoid startup clichés or vague AI buzzwords.
Keep responses concise and Discord-friendly (under 1800 characters).
When discussing tech news or topics, be insightful and add value beyond surface-level summaries.`;

const ELENOS_CONTEXT = `You are answering questions about Elenos AI on their official Discord server. Use only the following information — do not fabricate details.

ABOUT ELENOS AI:
Elenos AI is an AI systems and automation company. They build scalable digital systems, AI operators, and workflow automation tools for businesses.
Domain: elenos.ai | Founder: Edward Jones

BUSINESS MODEL:
Services → generate cash flow and document workflows
Systems → standardize and make workflows reusable
AI Operators → automate execution of those workflows
Products → package operators into scalable recurring revenue

WHAT THEY BUILD:
- AI workflow automation systems
- Custom software development
- AI operator deployment
- Entry offers: website audits, automation audits, system consultations
- Retainers: monthly optimization, automation support

PRODUCTS IN DEVELOPMENT:
- Assistant+: AI personal assistant platform (chat, calendar, notes, news, crypto/stock tracking) — flagship product
- EdTheStatMan: College football analytics and sports statistics platform

TECH STACK: Node.js, TypeScript, React, Next.js, Python, Supabase, Docker, Vercel

Answer questions about Elenos accurately and professionally. If something isn't covered above, say you don't have that information and direct them to elenos.ai.`;

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

  async summarizeArticle(title: string, url: string, content: string): Promise<string> {
    const prompt = `Summarize this tech article for a Discord community in exactly 3 bullet points. Be concise and insightful.

Title: ${title}
URL: ${url}
Content: ${content || '(no content available)'}

Format:
• [key point 1]
• [key point 2]
• [key point 3]`;

    return this.generateResponse(prompt, SYSTEM_PROMPT);
  }

  async breakdownArticle(title: string, url: string, content: string): Promise<string> {
    const prompt = `Break down this article for a Discord tech community. Use the actual content to give real insights, not just a surface-level summary.

Title: ${title}
URL: ${url}
Content: ${content || '(no content available)'}

Respond in this exact format (keep each section tight):
**TL;DR**
[2 sentence overview of what the article is actually about]

**Key Points**
• [specific point from the article]
• [specific point from the article]
• [specific point from the article]

**Why It Matters**
[1-2 sentences on the broader significance or impact]`;

    return this.generateResponse(prompt, SYSTEM_PROMPT);
  }

  async brainstorm(topic: string): Promise<string> {
    const prompt = `Generate 5 creative and practical ideas related to: "${topic}"
Format as a numbered list. Each idea should be 1-2 sentences. Focus on software/tech angles where relevant.`;

    return this.generateResponse(prompt, SYSTEM_PROMPT);
  }

  async answerAboutElenos(question: string): Promise<string> {
    return this.generateResponse(question, ELENOS_CONTEXT);
  }

  async evaluateOperator(workflow: string): Promise<string> {
    const prompt = `A user wants to know if the following workflow is a good candidate for AI automation (an "AI operator").

Evaluate it against these criteria:
- High repetition (does it happen often?)
- Clear inputs and outputs (is it well-defined?)
- Low ambiguity (are the steps consistent?)
- Measurable success (can you tell if it worked?)
- High time savings potential
- Reusable across clients or contexts

Workflow: "${workflow}"

Respond in this exact format:
**Operator Score: [X/10]**

**Strengths**
• [what makes this automatable]

**Challenges**
• [what makes it harder to automate]

**Recommendation**
[1-2 sentences: is this a good operator candidate, and what's the first step to automate it]`;

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
