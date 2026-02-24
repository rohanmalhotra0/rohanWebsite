import { useCallback, useEffect, useRef, useState } from 'react';

const SYSTEM_PROMPT = `You are RohanGPT, an assistant for Rohan Malhotra's portfolio.

Tone: rigorous, friendly, and precise. Keep positioning general (systems/infrastructure/applied research). Avoid heavy finance branding and avoid flashy hype.

If asked about Rohan: answer directly using only information that would reasonably appear on a portfolio (projects, research areas, coursework, experience themes). If a user asks for information you don't have, say so and offer what you do know from the page context.

When asked technical questions: provide concise, correct explanations and concrete examples when useful.`;

function getEnv(name) {
  try {
    return import.meta.env?.[name];
  } catch {
    return undefined;
  }
}

async function callOpenAI({ apiKey, model, messages }) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`OpenAI request failed (${res.status}). ${text}`.trim());
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('No response content received.');
  return content;
}

async function callExternalEndpoint({ url, messages }) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`RohanGPT endpoint failed (${res.status}). ${text}`.trim());
  }
  const data = await res.json();
  const content = data?.response ?? data?.content ?? data?.message;
  if (!content) throw new Error('No response content received.');
  return content;
}

export function useRohanGPTChat() {
  const [messages, setMessages] = useState(() => [
    {
      id: 'rgpt-welcome',
      role: 'assistant',
      content:
        'Ask me about projects, systems work, research topics, or coursework. I can also help translate the portfolio into recruiter-ready summaries.',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const messageListRef = useRef(null);
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    const api = messageListRef.current;
    if (api && typeof api.scrollToBottom === 'function') api.scrollToBottom();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  const sendMessage = useCallback(async (text) => {
    const input = (text || '').trim();
    if (!input || loading) return;

    setError(null);
    const userMsg = { id: `${Date.now()}-u`, role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const endpointUrl = getEnv('VITE_ROHANGPT_API_URL');
      const apiKey = getEnv('VITE_OPENAI_API_KEY');
      const model = getEnv('VITE_OPENAI_MODEL') || 'gpt-4o-mini';

      if (!endpointUrl && !apiKey) {
        throw new Error('Missing configuration: set VITE_ROHANGPT_API_URL or VITE_OPENAI_API_KEY.');
      }

      const history = messagesRef.current
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(-12)
        .map((m) => ({ role: m.role, content: m.content }));

      const payload = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history,
        { role: 'user', content: input },
      ];

      const reply = endpointUrl
        ? await callExternalEndpoint({ url: endpointUrl, messages: payload })
        : await callOpenAI({ apiKey, model, messages: payload });

      setMessages((prev) => [...prev, { id: `${Date.now()}-a`, role: 'assistant', content: reply }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to send message.';
      setError(msg);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-e`,
          role: 'assistant',
          content:
            'Sorry — I ran into an error sending that. If you are running locally, make sure `VITE_OPENAI_API_KEY` (or `VITE_ROHANGPT_API_URL`) is configured.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    messageListRef,
  };
}

