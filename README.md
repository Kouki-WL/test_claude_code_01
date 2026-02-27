# Chat Thing — Web Chat

A minimal, production-minded chat web app that connects to your [Chat Thing](https://chatthing.ai) channel via its public API.

Built with **Node.js 18+**, **Express**, and vanilla JS — no frontend frameworks required.

---

## アクセス先

| 環境 | URL |
|------|-----|
| **Web (Render)** | https://test-claude-code-01.onrender.com |
| **ローカル** | http://localhost:3000 |

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

## Setup (ローカル開発)

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

| Variable               | Where to find it |
|------------------------|------------------|
| `CHATTHING_API_KEY`    | Chat Thing dashboard → Settings → API → Secret Key |
| `CHATTHING_CHANNEL_ID` | Chat Thing dashboard → Channels → *your channel* → Channel ID |
| `PORT`                 | Optional, defaults to `3000` |

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

## Deployment (Render)

本プロジェクトは [Render](https://render.com) にデプロイ済みです。

**公開 URL:** https://test-claude-code-01.onrender.com

### Render への再デプロイ手順

1. `main` ブランチに変更をプッシュすると自動デプロイが走ります
2. Render ダッシュボードで以下の環境変数を設定してください

| Variable               | 説明 |
|------------------------|------|
| `CHATTHING_API_KEY`    | Chat Thing の API シークレットキー |
| `CHATTHING_CHANNEL_ID` | Chat Thing のチャンネル ID |
| `PORT`                 | Render が自動設定するため通常不要 |

> **Important:** Never commit your `.env` file. It is listed in `.gitignore`.

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

## License

MIT
