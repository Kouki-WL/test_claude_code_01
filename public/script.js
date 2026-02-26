/**
 * script.js — Chat Thing Web Chat frontend
 *
 * Responsibilities:
 *  - Capture user input and POST to /api/chat
 *  - Render user/bot bubbles with animations
 *  - Show a loading spinner while waiting
 *  - Maintain conversationId in memory for multi-turn conversations
 *  - Auto-resize the textarea as the user types
 *  - Auto-scroll the chat window to the latest message
 */

// ── State ────────────────────────────────────────────────────────────────────

/**
 * conversationId persists across messages in this session so Chat Thing
 * maintains context. It is NOT saved to localStorage intentionally — a page
 * refresh starts a fresh conversation.
 * @type {string|null}
 */
let conversationId = null;

// ── DOM references ───────────────────────────────────────────────────────────

const chatWindow = document.getElementById('chatWindow');
const chatForm   = document.getElementById('chatForm');
const userInput  = document.getElementById('userInput');
const sendBtn    = document.getElementById('sendBtn');

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Append a message bubble to the chat window and scroll into view.
 *
 * @param {'user'|'bot'|'error'} role
 * @param {string} text
 * @returns {HTMLElement} The outer .message div (useful for the loading state)
 */
function appendMessage(role, text) {
  const row    = document.createElement('div');
  const bubble = document.createElement('div');

  row.classList.add('message', role);
  bubble.classList.add('bubble');
  bubble.textContent = text;

  row.appendChild(bubble);
  chatWindow.appendChild(row);
  scrollToBottom();

  return row;
}

/**
 * Append a loading indicator (spinner + label) that can be removed later.
 * @returns {HTMLElement} The message row to remove when done.
 */
function appendLoading() {
  const row    = document.createElement('div');
  const bubble = document.createElement('div');
  const spinner = document.createElement('span');
  const label   = document.createElement('span');

  row.classList.add('message', 'bot', 'loading');
  bubble.classList.add('bubble');
  spinner.classList.add('spinner');
  label.textContent = '考え中…';

  bubble.appendChild(spinner);
  bubble.appendChild(label);
  row.appendChild(bubble);
  chatWindow.appendChild(row);
  scrollToBottom();

  return row;
}

/** Scroll the chat window to the very bottom. */
function scrollToBottom() {
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/** Disable / enable the send button and input. */
function setLoading(isLoading) {
  sendBtn.disabled    = isLoading;
  userInput.disabled  = isLoading;
}

/**
 * Auto-resize the textarea to fit its content (up to max-height in CSS).
 */
function autoResize() {
  userInput.style.height = 'auto';
  userInput.style.height = userInput.scrollHeight + 'px';
}

// ── Core: send a message ─────────────────────────────────────────────────────

/**
 * Send the user's message to /api/chat and display the response.
 * @param {string} message
 */
async function sendMessage(message) {
  // Render the user's bubble immediately
  appendMessage('user', message);

  // Show the loading indicator
  const loadingRow = appendLoading();
  setLoading(true);

  try {
    const response = await fetch('/api/chat', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        // Include conversationId only if we have one
        ...(conversationId && { conversationId }),
      }),
    });

    // Remove the spinner before rendering the reply
    loadingRow.remove();

    if (!response.ok) {
      // Server returned an error — try to extract the message
      const data = await response.json().catch(() => ({}));
      const errText = data.error ?? `サーバーエラー (${response.status})`;
      appendMessage('error', errText);
      return;
    }

    const data = await response.json();

    // Persist the conversationId returned by Chat Thing for subsequent turns
    if (data.conversationId) {
      conversationId = data.conversationId;
    }

    // Render the bot's reply
    appendMessage('bot', data.reply ?? '（返答なし）');

  } catch (err) {
    // Network failure (offline, server down, etc.)
    loadingRow.remove();
    appendMessage('error', 'サーバーに接続できませんでした。通信環境をご確認の上、再度お試しください。');
    console.error('[chat] Fetch error:', err);
  } finally {
    setLoading(false);
    userInput.focus();
  }
}

// ── Event listeners ──────────────────────────────────────────────────────────

// Form submit (button click or Enter key)
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const text = userInput.value.trim();
  if (!text) return;

  // Clear and reset the textarea
  userInput.value = '';
  autoResize();

  sendMessage(text);
});

// Shift+Enter で送信、plain Enter で改行
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.shiftKey) {
    e.preventDefault();
    chatForm.requestSubmit();
  }
});

// Grow/shrink textarea as the user types
userInput.addEventListener('input', autoResize);

// Focus the input on page load so the user can start typing immediately
userInput.focus();
