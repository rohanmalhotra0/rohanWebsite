import { useCallback, useEffect, useRef, useState } from 'react';

const SYSTEM_PROMPT = `You are RohanGPT, the professional portfolio guide for Rohan Malhotra.

Keep answers concise, accurate, friendly, and grounded in this public profile:
- NYU Courant: B.A. Computer Science, Mathematics minor, accelerated three-year path, expected May 2027, GPA 3.7.
- DRW via IBM: Oracle EPM forecasting, Oracle Integration Cloud banking pipelines, an XGBoost cash-flow model, Qwen-Coder-32B fine-tuning, and an on-prem RAG/MCP EPM assistant.
- IBM Robotics: a Boston Dynamics Spot perception stack using YOLO11, OpenCV, gRPC, multithreading, and lock-free queues; about 99.5% mAP@50.
- Kalshi: job-loss hazard modeling, Monte Carlo hedge research, a Next.js/Python recommendation engine, C++ risk tools, and FRED/BLS integrations.
- Hume Center: C imaging and signal-processing tests for ContentCube, deployed into low Earth orbit.
- Featured products: EPM Wizard, CuriousAI, Oracle EPM Interactive Guide, Casen, NightShift, Refrax, ModelKalshi, GreenSticker, and Rohan's research tools.

Do not invent employers, metrics, dates, publications, or project claims. If a fact is not in this context, say so and direct the visitor to the résumé or GitHub.`;

const QUICK_ANSWERS = [
  {
    matches: ['ibm', 'robot', 'spot', 'yolo'],
    answer:
      'At IBM, Rohan built the perception and autonomy stack for a Boston Dynamics Spot retrieval demo. He trained YOLO11 on 898 labeled images (about 99.5% mAP@50), connected inference through OpenCV, gRPC, multithreading, and lock-free queues, and demoed the autonomous toy finder at IBM DevCon.',
  },
  {
    matches: ['drw', 'epm', 'oracle', 'qwen'],
    answer:
      'On the IBM delivery team at DRW, Rohan shipped Oracle EPM forecasting and close workflows, integrated banking data through Oracle Integration Cloud, fine-tuned Qwen-Coder-32B from 36.7% to 95.0% task accuracy, and deployed an on-prem RAG/MCP assistant for EPM artifact creation.',
  },
  {
    matches: ['kalshi', 'hedg', 'monte carlo', 'prediction market'],
    answer:
      'For Kalshi, Rohan co-authored income-risk hedging research, modeled job loss as a macro-sensitive hazard process, ran Monte Carlo tail-risk comparisons, and turned the work into a Next.js/Python recommendation engine with FRED, BLS, Docker, and C++ risk tools.',
  },
  {
    matches: ['best project', 'featured', 'project'],
    answer:
      'The best starting points are EPM Wizard for applied enterprise AI, the IBM Spot pipeline for robotics, ModelKalshi for quantitative product work, CuriousAI for evidence-backed RAG, and Refrax for interactive quantitative research. The project archive includes more than twenty additional builds.',
  },
  {
    matches: ['research', 'paper', 'reddit', 'kelly'],
    answer:
      'Rohan’s research spans prediction-market income hedging, Reddit sentiment in financial applications, Kelly-style capital allocation, and CubeSat imaging systems. Each paper or artifact is linked in the Research section.',
  },
  {
    matches: ['nyu', 'education', 'course', 'gpa'],
    answer:
      'Rohan is completing a B.A. in Computer Science with a Mathematics minor at NYU Courant on an accelerated three-year path. His expected graduation is May 2027 and his current GPA is 3.7/4.0.',
  },
  {
    matches: ['skill', 'stack', 'language'],
    answer:
      'His working stack includes Python, Java, C/C++, SQL, Groovy, PyTorch, YOLO11, OpenCV, XGBoost, RAG, Docker, AWS, gRPC, PostgreSQL, Oracle EPM, OIC, and Monte Carlo tooling.',
  },
  {
    matches: ['resume', 'contact', 'email', 'hire'],
    answer:
      'Use “View Resume” in the navigation for the recruiter-facing profile and downloadable PDF. You can reach Rohan at rohanm8974@gmail.com or through the LinkedIn and GitHub links in the contact section.',
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
        'I’m the fast portfolio guide. Ask about IBM robotics, the DRW/EPM work, Kalshi research, projects, skills, or the résumé.',
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
                'The live model is offline in this preview, but the instant portfolio answers are ready. Try asking about IBM, DRW, Kalshi, projects, research, skills, or the résumé.',
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
