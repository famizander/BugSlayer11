import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini if key is present
const geminiApiKey = process.env.GEMINI_API_KEY;
const ai = geminiApiKey
  ? new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// API Route: AI-powered code & error analysis
app.post('/api/analyze', async (req, res) => {
  const { code, language, expectedOutput } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }

  // If Gemini API is available, leverage it for rich Socratic diagnostics
  if (ai && geminiApiKey) {
    try {
      const prompt = `You are BugSlayer, an AI programming tutor for students learning ${language === 'cpp' ? 'C++' : 'Python'}.
Analyze this code submission.

Student's code:
\`\`\`${language}
${code}
\`\`\`

Expected output: "${expectedOutput || ''}"

Return a strict JSON object with these exact keys:
{
  "status": "Error Found" | "Fixed" | "No Errors",
  "compilerOutput": "Exact compiler error or interpreter traceback (e.g. 'error: expected ';' before 'cout'') as a real compiler would say",
  "expectedOutput": "${expectedOutput || ''}",
  "actualOutput": "What the program produced or why it stopped",
  "errorSummary": "Short 1-line label of the bug (e.g. 'Missing semicolon on line 4')",
  "hints": [
    "Hint 1: General high-level Socratic clue pointing to the area without giving the answer",
    "Hint 2: More specific line inspection clue",
    "Hint 3: Concrete clue helping student finish the fix"
  ],
  "explanation": "Clear, student-friendly explanation of why this error happens and how the language parser works",
  "correctedCode": "The full working corrected code",
  "learningTips": [
    "Tip 1 to prevent this mistake in the future",
    "Tip 2"
  ],
  "progressPercent": 65
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return res.json(parsed);
    } catch (err) {
      console.warn('Gemini analysis failed or fallback triggered:', err);
      // Fall through to local diagnosis
    }
  }

  // Fallback diagnostic if no Gemini API key is configured
  return res.status(200).json({ fallback: true });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BugSlayer server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
