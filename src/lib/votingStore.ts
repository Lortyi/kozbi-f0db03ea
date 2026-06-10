// Voting data store - PHP/MySQL API backend (Apache) with localStorage fallback (preview)
export interface Poll {
  id: string;
  question: string;
  options: string[];
  status: 'active' | 'closed';
  votes: Record<string, number>; // option index -> count
  deviceVotes: string[]; // device IDs that have voted
  createdAt: number;
}

// API alapcím. Apache alatt a /kozbi/api/index.php szolgálja ki.
// Felülírható .env-ben: VITE_API_BASE=https://domain.hu/kozbi/api/index.php
const API_BASE = (import.meta.env.VITE_API_BASE as string) || '/kozbi/api/index.php';

const DEVICE_KEY = 'votepulse_device_id';
const POLLS_KEY = 'akb_polls_fallback';

// Ha az API nem elérhető (pl. Lovable preview, nincs PHP), localStorage-ra váltunk.
let useFallback = false;

// Get or create a unique device ID
export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = `device_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

// ---- localStorage fallback implementáció ----
function lsRead(): Poll[] {
  try {
    return JSON.parse(localStorage.getItem(POLLS_KEY) || '[]');
  } catch {
    return [];
  }
}

function lsWrite(polls: Poll[]): Poll[] {
  localStorage.setItem(POLLS_KEY, JSON.stringify(polls));
  return polls;
}

async function api<T>(action: string, body?: unknown): Promise<T> {
  const url = `${API_BASE}?action=${action}`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: body ? 'POST' : 'GET',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    console.error(`[AKB API] Nem sikerült elérni: ${url}`, e);
    throw e;
  }
  const text = await res.text();
  if (!res.ok) {
    console.error(`[AKB API] HTTP ${res.status} (${url}). Válasz:`, text.slice(0, 500));
    throw new Error(`API error: ${res.status}`);
  }
  // Ha nem JSON érkezik (pl. nyers PHP forrás, vagy HTML hibaoldal) -> fallback
  try {
    return JSON.parse(text) as T;
  } catch {
    console.error(`[AKB API] Nem JSON válasz (${url}). Ezt kaptuk:`, text.slice(0, 500));
    throw new Error('Invalid JSON (no PHP backend)');
  }
}

// Biztonságos normalizálás: a szerverről érkező adat hibás/hiányos mezőit kijavítja,
// így a felület nem omlik össze (fekete képernyő).
function normalizePoll(p: unknown): Poll {
  const o = (p && typeof p === 'object' ? p : {}) as Record<string, unknown>;
  return {
    id: String(o.id ?? `poll_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`),
    question: typeof o.question === 'string' ? o.question : '',
    options: Array.isArray(o.options) ? o.options.map(String) : [],
    status: o.status === 'closed' ? 'closed' : 'active',
    votes: o.votes && typeof o.votes === 'object' && !Array.isArray(o.votes)
      ? (o.votes as Record<string, number>)
      : {},
    deviceVotes: Array.isArray(o.deviceVotes) ? o.deviceVotes.map(String) : [],
    createdAt: Number(o.createdAt) || 0,
  };
}

function normalizePolls(data: unknown): Poll[] {
  return Array.isArray(data) ? data.map(normalizePoll) : [];
}

export async function getPolls(): Promise<Poll[]> {
  if (useFallback) return lsRead();
  try {
    return normalizePolls(await api<Poll[]>('list'));
  } catch {
    useFallback = true;
    console.warn('[AKB] Az API nem elérhető – localStorage tartalékra váltás (a szavazások csak ezen az eszközön látszanak).');
    return lsRead();
  }
}

export async function createPoll(question: string, options: string[]): Promise<Poll[]> {
  if (!useFallback) {
    try {
      return normalizePolls(await api<Poll[]>('create', { question, options }));
    } catch {
      useFallback = true;
    }
  }
  const polls = lsRead();
  const newPoll: Poll = {
    id: `poll_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    question,
    options: options.filter(Boolean),
    status: 'active',
    votes: {},
    deviceVotes: [],
    createdAt: Date.now(),
  };
  return lsWrite([newPoll, ...polls]);
}

export async function updatePollStatus(id: string, status: 'active' | 'closed'): Promise<Poll[]> {
  if (!useFallback) {
    try {
      return normalizePolls(await api<Poll[]>('status', { id, status }));
    } catch {
      useFallback = true;
    }
  }
  const polls = lsRead().map(p => (p.id === id ? { ...p, status } : p));
  return lsWrite(polls);
}

export async function deletePoll(id: string): Promise<Poll[]> {
  if (!useFallback) {
    try {
      return normalizePolls(await api<Poll[]>('delete', { id }));
    } catch {
      useFallback = true;
    }
  }
  return lsWrite(lsRead().filter(p => p.id !== id));
}

export type VoteResult = 'success' | 'already_voted' | 'closed' | 'not_found';

export async function castVote(
  pollId: string,
  optionIndex: number,
  deviceId: string
): Promise<{ result: VoteResult; polls?: Poll[] }> {
  if (!useFallback) {
    try {
      return await api<{ result: VoteResult; polls?: Poll[] }>('vote', { pollId, optionIndex, deviceId });
    } catch {
      useFallback = true;
    }
  }
  const polls = lsRead();
  const poll = polls.find(p => p.id === pollId);
  if (!poll) return { result: 'not_found' };
  if (poll.status === 'closed') return { result: 'closed' };
  if (poll.deviceVotes.includes(deviceId)) return { result: 'already_voted' };
  const key = optionIndex.toString();
  poll.votes[key] = (poll.votes[key] || 0) + 1;
  poll.deviceVotes.push(deviceId);
  return { result: 'success', polls: lsWrite(polls) };
}

export function getTotalVotes(poll: Poll): number {
  return Object.values(poll.votes).reduce((a, b) => a + b, 0);
}

export function getVoteData(poll: Poll): { option: string; votes: number; percentage: number }[] {
  const total = getTotalVotes(poll);
  return poll.options.map((option, i) => {
    const count = poll.votes[i.toString()] || 0;
    return {
      option,
      votes: count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    };
  });
}
