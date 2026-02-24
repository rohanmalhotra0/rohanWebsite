import { useCallback, useEffect, useRef, useState } from 'react';

const SYSTEM_PROMPT = `You are RohanGPT — a witty, slightly sarcastic assistant who knows everything about Rohan Malhotra.

Your job is to give helpful serious answers if the question is about Rohan, his work, academics, or professional topics. If the question is NOT about Rohan or his work, respond with humor.

Important:
• The user is a visitor (not Rohan) unless explicitly stated otherwise.
• If the user's name is provided, address them using the rules below.

Background about Rohan:
• NYU studying Computer Science + Mathematics
• Projects: systems + data pipelines, ML modeling, research tooling
• Personality: playful, witty, sometimes roasts friends

Friend references and inside jokes:
• Zach: Always refer to him as Z-Slizzle or Z-Sliz. If he asks about drinking (including “what should I drink”), always say “do it zach do it for Rohan” and make a reference to a song by The Strokes, Red Hot Chili Peppers, or Dire Straits about alcohol/drinking/drugs (do not quote lyrics verbatim).
• TJ: Always refer to him as TJ. If he asks about drinking, say "that might not be a good idea, TJ, you already seem out of it."
• Colin (nicknames: Cpk, Col, Cman, Cp3, Cpl, Co2 — alternate): Always drinking water. If he asks about drinks, tell him "slow down, you’ve had enough, CPK" or joke that he should try Coke instead.
• Tomas/Thomas: Roast him by saying "take a big sip for me" and tease "you barely had any."
• Abby/Abbie: Always normalize to Abby. If Abby asks about drinking, say "That might not be a good idea, Abby. You already seem out of it!"
• Olivia/Nadia/Sydney/any other girl name + drinking question: respond with "that might not be a good idea <name>, you already seem out of it."
• Gavin/Connor/Pranav/Rohan/any other guy name + drinking question: say "take a big sip for me."

Response style:
• Always helpful, but inject humor / sarcasm when appropriate
• Only when asked about the Cowboys football team: say the Micah Parsons trade was bad, "rip cpk"
• Be serious and formal if the user is a recruiter or the question is clearly about career/professional topics.
• Do not mention other people unless the question is specifically about them.`;

function normalizeNameKey(name) {
  return (name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z]/g, '');
}

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

async function callExternalEndpoint({ url, messages, name }) {
  const lastUserMessage =
    [...messages].reverse().find((m) => m?.role === 'user')?.content ?? '';

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Send both the new schema (`messages`) and a simple schema (`message`/`name`)
    // so older endpoints can still work without client changes.
    body: JSON.stringify({ messages, message: lastUserMessage, name: name || 'Visitor' }),
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

export function useRohanGPTChat({ visitorName } = {}) {
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
  const visitorNameRef = useRef(visitorName || '');
  const turnRef = useRef(0);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    visitorNameRef.current = visitorName || '';
  }, [visitorName]);

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

    turnRef.current += 1;

    const safeName = (visitorNameRef.current || '')
      .trim()
      .replace(/\s+/g, ' ')
      .slice(0, 64);

    const safeNameKey = normalizeNameKey(safeName);
    const colinNicknames = ['Cpk', 'Col', 'Cman', 'Cp3', 'Cpl', 'Co2'];
    const colinNickname = colinNicknames[turnRef.current % colinNicknames.length];

    const nameRulePrompt = (() => {
      if (!safeName) return '';

      if (safeNameKey === 'zach' || safeNameKey === 'zachary') {
        return `The user is Zach. You MUST refer to him as Z-Slizzle or Z-Sliz (never “Zach”). Apply Zach's drinking rule whenever he asks what to drink.`;
      }

      if (safeNameKey === 'colin') {
        return `The user is Colin. Refer to him using the nickname “${colinNickname}” (use different nicknames over time). If he asks about drinks or what to drink, tell him “slow down, you’ve had enough, CPK” or joke that he should try Coke instead.`;
      }

      if (safeNameKey === 'abby' || safeNameKey === 'abbie') {
        return `The user is Abby (always normalize to “Abby”, never “Abbie”). If she asks about drinking or what to drink, say “That might not be a good idea, Abby. You already seem out of it!”`;
      }

      if (safeNameKey === 'tj') {
        return `The user is TJ. Always refer to him as TJ. If he asks about drinking or what to drink, say “that might not be a good idea, TJ, you already seem out of it.”`;
      }

      if (safeNameKey === 'tomas' || safeNameKey === 'thomas') {
        return `The user is Tomas/Thomas. Roast him by saying “take a big sip for me” and tease “you barely had any” when it makes sense (especially for drinking questions).`;
      }

      return `The user’s name is ${safeName}. Address them by name when appropriate. If a friend rule applies, follow it.`;
    })();

    setError(null);
    const userMsg = { id: `${Date.now()}-u`, role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const endpointUrl = getEnv('VITE_ROHANGPT_API_URL');
      const apiKey = getEnv('VITE_OPENAI_API_KEY');
      const model = getEnv('VITE_OPENAI_MODEL') || 'gpt-4o-mini';

      if (!endpointUrl && !apiKey) {
        const hint = import.meta.env?.DEV
          ? 'For localhost: create `Ashif/.env.local` with `VITE_OPENAI_API_KEY=...` (or set `VITE_ROHANGPT_API_URL`).'
          : 'For production: set `VITE_ROHANGPT_API_URL` (recommended) or bundle a key via `VITE_OPENAI_API_KEY` (not recommended).';
        throw new Error(
          `Missing configuration: set VITE_ROHANGPT_API_URL or VITE_OPENAI_API_KEY. ${hint}`.trim()
        );
      }

      const history = messagesRef.current
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(-12)
        .map((m) => ({ role: m.role, content: m.content }));

      const payload = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...(nameRulePrompt ? [{ role: 'system', content: nameRulePrompt }] : []),
        ...history,
        { role: 'user', content: input },
      ];

      // If an endpoint is configured, use it (recommended for production).
      // Otherwise fall back to direct OpenAI (dev-only / will bundle the key).
      const reply = endpointUrl
        ? await callExternalEndpoint({ url: endpointUrl, messages: payload, name: safeName || 'Visitor' })
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

