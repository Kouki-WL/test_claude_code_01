/**
 * server.js
 * Chat Thing Web Chat — Express backend
 *
 * Exposes a single POST /api/chat endpoint that proxies messages
 * to the Chat Thing public channel API and returns the bot reply.
 */

import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// ── Config ──────────────────────────────────────────────────────────────────

const PORT           = process.env.PORT              || 3000;
const API_KEY        = process.env.CHATTHING_API_KEY;
const CHANNEL_ID     = process.env.CHATTHING_CHANNEL_ID;
const CHATTHING_BASE = 'https://chatthing.ai/api/public/channels';

// Validate required env vars at startup so we fail fast
if (!API_KEY || !CHANNEL_ID) {
  console.error(
    '[ERROR] Missing required environment variables.\n' +
    '        Please set CHATTHING_API_KEY and CHATTHING_CHANNEL_ID in your .env file.'
  );
  process.exit(1);
}

// ── Express setup ────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();

// Parse incoming JSON bodies
app.use(express.json());

// Serve the frontend from /public
app.use(express.static(path.join(__dirname, 'public')));

// ── POST /api/chat ────────────────────────────────────────────────────────────

app.post('/api/chat', async (req, res) => {
  const { message, conversationId } = req.body;

  // Basic input validation
  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: 'message is required and must be a non-empty string.' });
  }

  // Build the Chat Thing request payload
  const payload = { message: message.trim() };
  if (conversationId) {
    payload.conversationId = conversationId;
  }

  const url = `${CHATTHING_BASE}/${CHANNEL_ID}/1.0/message`;

  try {
    const upstream = await fetch(url, {
      method:  'POST',
      headers: {
        'Content-Type':      'application/json',
        'X-API-Secret-Key':  API_KEY,
      },
      body: JSON.stringify(payload),
    });

    // Surface upstream HTTP errors with the original status code
    if (!upstream.ok) {
      const errorText = await upstream.text();
      console.error(`[Chat Thing API] ${upstream.status} ${upstream.statusText}:`, errorText);
      return res.status(upstream.status).json({
        error: `Chat Thing API returned ${upstream.status}: ${upstream.statusText}`,
      });
    }

    const data = await upstream.json();
    console.log('[Chat Thing API] Response:', JSON.stringify(data, null, 2));

    return res.json({ reply: data.response, conversationId: data.conversationId });

  } catch (err) {
    // Network-level failure (DNS, timeout, etc.)
    console.error('[Chat Thing API] Network error:', err.message);
    return res.status(502).json({ error: 'Unable to reach Chat Thing API. Please try again later.' });
  }
});

// ── Catch-all: serve index.html for any unmatched route (SPA-friendly) ───────

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`[server] Listening on http://localhost:${PORT}`);
});
