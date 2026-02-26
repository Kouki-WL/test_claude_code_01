# Chat Thing — Web Chat

A minimal, production-minded chat web app that connects to your [Chat Thing](https://chatthing.ai) channel via its public API.

Built with **Node.js 18+**, **Express**, and vanilla JS — no frontend frameworks required.

---

## Features

- Clean, responsive chat UI with smooth animations
- Multi-turn conversations (conversationId maintained in memory per session)
- Loading spinner while waiting for a reply
- Error handling with user-friendly messages
- Zero hardcoded secrets — all config via environment variables

---

## Project structure

```
.
├── server.js           # Express backend & Chat Thing proxy
├── public/
│   ├── index.html      # App shell
│   ├── style.css       # Styles
│   └── script.js       # Frontend logic
├── .env.example        # Template — copy to .env
├── .gitignore
├── package.json
└── README.md
```

---

## Prerequisites

- **Node.js 18+** (uses native `fetch` and `--watch`)
- A [Chat Thing](https://chatthing.ai) account with at least one public channel

---

## Setup

### 1. Clone / download the project

```bash
git clone <your-repo-url>
cd chatthing-web-chat
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

| Variable              | Where to find it |
|-----------------------|------------------|
| `CHATTHING_API_KEY`   | Chat Thing dashboard → Settings → API → Secret Key |
| `CHATTHING_CHANNEL_ID`| Chat Thing dashboard → Channels → *your channel* → Channel ID |
| `PORT`                | Optional, defaults to `3000` |

### 4. Start the server

```bash
# Production
npm start

# Development (auto-restarts on file changes, Node 18+)
npm run dev
```

### 5. Open in browser

```
http://localhost:3000
```

---

## API reference

### `POST /api/chat`

Proxies a message to Chat Thing and returns the bot's reply.

**Request body**

```json
{
  "message": "Hello!",
  "conversationId": "optional — omit on first message"
}
```

**Success response `200`**

```json
{
  "reply": "Hi there! How can I help?",
  "conversationId": "abc123"
}
```

**Error responses**

| Status | Meaning |
|--------|---------|
| `400`  | `message` field is missing or empty |
| `4xx`  | Chat Thing API returned a client error |
| `502`  | Could not reach Chat Thing (network error) |

---

## Deployment

The app is stateless and requires only two environment variables, making it easy to deploy to any platform:

- **Railway / Render / Fly.io** — push the repo, set `CHATTHING_API_KEY`, `CHATTHING_CHANNEL_ID`, and `PORT` in the platform's environment settings.
- **Heroku** — `heroku config:set CHATTHING_API_KEY=... CHATTHING_CHANNEL_ID=...`
- **Docker** — pass the variables via `--env-file .env` or `-e` flags.

> **Important:** Never commit your `.env` file. It is listed in `.gitignore`.

---

## License

MIT
