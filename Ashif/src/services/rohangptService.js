import { useCallback, useEffect, useRef, useState } from 'react';

const SYSTEM_PROMPT = `You are RohanGPT. Answer as Rohan in a conversational first-person voice.

Be specific and factual. Avoid résumé-speak, hype, and phrases such as "at the intersection of," "cutting-edge," or "shipped." Use this public profile:
- NYU Courant: B.A. Computer Science, Mathematics minor, accelerated three-year path, expected May 2027, GPA 3.7.
- DRW via IBM: Oracle EPM forecasting, Oracle Integration Cloud banking pipelines, an XGBoost cash-flow model, Qwen-Coder-32B fine-tuning, and an on-prem RAG/MCP EPM assistant.
- IBM Robotics: a Boston Dynamics Spot perception stack using YOLO11, OpenCV, gRPC, multithreading, and lock-free queues; about 99.5% mAP@50.
- Kalshi: job-loss hazard modeling, Monte Carlo hedge research, a Next.js/Python recommendation engine, C++ risk tools, and FRED/BLS integrations.
- Hume Center: C imaging and signal-processing tests for ContentCube, deployed into low Earth orbit.
- Featured products: EPM Wizard, Oracle EPM Interactive Guide, Casen, NightShift, Refrax, ModelKalshi, GreenSticker, and Rohan's research tools.

Do not invent employers, metrics, dates, publications, or project claims. If a fact is not here, say that plainly and point to my résumé or GitHub.`;

const QUICK_ANSWERS = [
  {
    matches: ['ibm', 'robot', 'spot', 'yolo'],
    answer:
      'At IBM, I built the perception and autonomy stack for a Boston Dynamics Spot retrieval demo. I trained YOLO11 on 898 labeled images (about 99.5% mAP@50), connected inference through OpenCV and gRPC, and demoed the toy finder at IBM DevCon.',
  },
  {
    matches: ['drw', 'epm', 'oracle', 'qwen'],
    answer:
      'On IBM’s delivery team at DRW, I built Oracle EPM forecasting and close workflows, connected banking data through Oracle Integration Cloud, fine-tuned Qwen-Coder-32B from 36.7% to 95.0% task accuracy, and built an on-prem assistant for creating EPM artifacts.',
  },
  {
    matches: ['kalshi', 'hedg', 'monte carlo', 'prediction market'],
    answer:
      'For Kalshi, I co-authored research on hedging income risk, modeled job loss as a macro-sensitive hazard process, ran Monte Carlo tail-risk comparisons, and turned the work into a Next.js/Python recommendation tool.',
  },
  {
    matches: ['best project', 'featured', 'project'],
    answer:
      'I’d start with EPM Wizard for enterprise AI, the Spot vision system for robotics, the Kalshi hedging engine for quantitative work, and Refrax for interactive research.',
  },
  {
    matches: ['research', 'paper', 'reddit', 'kelly'],
    answer:
      'My research covers prediction-market income hedging, Reddit sentiment in financial applications, Kelly-style capital allocation, and CubeSat imaging systems.',
  },
  {
    matches: ['nyu', 'education', 'course', 'gpa'],
    answer:
      'I’m completing a B.A. in Computer Science with a Mathematics minor at NYU Courant on an accelerated three-year path. I expect to graduate in May 2027; my current GPA is 3.7/4.0.',
  },
  {
    matches: ['skill', 'stack', 'language'],
    answer:
      'I work mostly in Python, Java, C/C++, SQL, PyTorch, OpenCV, XGBoost, Docker, AWS, gRPC, PostgreSQL, Oracle EPM, and OIC.',
  },
  {
    matches: ['resume', 'contact', 'email', 'hire'],
    answer:
      'You can open my résumé from the navigation, email me at rohanm8974@gmail.com, or use the LinkedIn and GitHub links in the contact section.',
  },
];

function getEnv(name) {
  try {
    return import.meta.env?.[name];
  } catch {
    return undefined;
  }
}

function quickAnswerFor(input) {
  const normalized = input.toLowerCase();
  return QUICK_ANSWERS.find((entry) =>
    entry.matches.some((keyword) => normalized.includes(keyword))
  )?.answer;
}

async function callExternalEndpoint({ url, messages, name, signal }) {
  const lastUserMessage =
    [...messages].reverse().find((message) => message?.role === 'user')?.content ?? '';

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      messages,
      message: lastUserMessage,
      name: name || 'Visitor',
      systemPrompt: SYSTEM_PROMPT,
    }),
  });

  if (!response.ok) {
    throw new Error(`RohanGPT is temporarily unavailable (${response.status}).`);
  }

  const data = await response.json();
  const content = data?.response ?? data?.content ?? data?.message;
  if (!content) throw new Error('RohanGPT returned an empty response.');
  return content;
}

export function useRohanGPTChat({ visitorName } = {}) {
  const [messages, setMessages] = useState(() => [
    {
      id: 'rgpt-welcome',
      role: 'assistant',
      content:
        'Hey, ask me about the work, projects, research, skills, or résumé.',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const messageListRef = useRef(null);
  const messagesRef = useRef(messages);
  const visitorNameRef = useRef(visitorName || '');
  const abortRef = useRef(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    visitorNameRef.current = visitorName || '';
  }, [visitorName]);

  useEffect(
    () => () => {
      abortRef.current?.abort();
    },
    []
  );

  const scrollToBottom = useCallback(() => {
    const api = messageListRef.current;
    if (api && typeof api.scrollToBottom === 'function') api.scrollToBottom();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  const sendMessage = useCallback(
    async (text) => {
      const input = (text || '').trim();
      if (!input || loading) return;

      const safeName = (visitorNameRef.current || '')
        .trim()
        .replace(/\s+/g, ' ')
        .slice(0, 64);
      const userMessage = { id: `${Date.now()}-u`, role: 'user', content: input };

      setError(null);
      setMessages((previous) => [...previous, userMessage]);
      setLoading(true);

      try {
        const quickAnswer = quickAnswerFor(input);
        if (quickAnswer) {
          setMessages((previous) => [
            ...previous,
            {
              id: `${Date.now()}-a`,
              role: 'assistant',
              content: safeName ? `${safeName}, ${quickAnswer}` : quickAnswer,
            },
          ]);
          return;
        }

        const endpointUrl = getEnv('VITE_ROHANGPT_API_URL');
        if (!endpointUrl) {
          setMessages((previous) => [
            ...previous,
            {
              id: `${Date.now()}-offline`,
              role: 'assistant',
              content:
                'I can’t reach the full chat service from here. Try asking about IBM, DRW, Kalshi, my projects, research, skills, or résumé; those answers are available locally.',
            },
          ]);
          return;
        }

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        const timeout = window.setTimeout(() => controller.abort(), 20000);

        const history = messagesRef.current
          .filter((message) => message.role === 'user' || message.role === 'assistant')
          .slice(-8)
          .map((message) => ({ role: message.role, content: message.content }));

        const payload = [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history,
          { role: 'user', content: input },
        ];

        try {
          const reply = await callExternalEndpoint({
            url: endpointUrl,
            messages: payload,
            name: safeName,
            signal: controller.signal,
          });
          setMessages((previous) => [
            ...previous,
            { id: `${Date.now()}-a`, role: 'assistant', content: reply },
          ]);
        } finally {
          window.clearTimeout(timeout);
        }
      } catch (caughtError) {
        const message =
          caughtError?.name === 'AbortError'
            ? 'That request took too long. Please try again.'
            : caughtError instanceof Error
              ? caughtError.message
              : 'RohanGPT could not answer that request.';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  return {
    messages,
    loading,
    error,
    sendMessage,
    messageListRef,
    scrollMessagesToBottom: scrollToBottom,
  };
}
