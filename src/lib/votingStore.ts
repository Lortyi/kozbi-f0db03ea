// Voting data store - KIZÁRÓLAG PHP/MySQL API backend (Apache).
// Nincs localStorage tartalék: ha a szerver nem elérhető, hibát dobunk,
// és helyileg NEM jön létre szavazás.
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

// Get or create a unique device ID
export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = `device_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
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
    throw new Error('Nincs kapcsolat a szerverrel');
  }
  const text = await res.text();
  if (!res.ok) {
    console.error(`[AKB API] HTTP ${res.status} (${url}). Válasz:`, text.slice(0, 500));
    throw new Error(`Szerver hiba (${res.status})`);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    console.error(`[AKB API] Nem JSON válasz (${url}). Ezt kaptuk:`, text.slice(0, 500));
    throw new Error('Érvénytelen szerverválasz');
  }
}

// Biztonságos normalizálás: a szerverről érkező adat hibás/hiányos mezőit kijavítja,
// így a felület nem omlik össze (fekete képernyő).
function toOptionsArray(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String);
  // A szerver néha JSON-stringként adja vissza az options mezőt – ezt is kezeljük.
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      /* nem JSON, marad üres */
    }
  }
  // Objektumként ({0:"A",1:"B"}) érkező opciók kezelése.
  if (raw && typeof raw === 'object') {
    return Object.values(raw as Record<string, unknown>).map(String);
  }
  return [];
}

function normalizePoll(p: unknown): Poll {
  const o = (p && typeof p === 'object' ? p : {}) as Record<string, unknown>;
  return {
    id: String(o.id ?? `poll_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`),
    question: typeof o.question === 'string' ? o.question : '',
    options: toOptionsArray(o.options),
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
  return normalizePolls(await api<Poll[]>('list'));
}

export async function createPoll(question: string, options: string[]): Promise<Poll[]> {
  return normalizePolls(await api<Poll[]>('create', { question, options }));
}

export async function updatePollStatus(id: string, status: 'active' | 'closed'): Promise<Poll[]> {
  return normalizePolls(await api<Poll[]>('status', { id, status }));
}

export async function deletePoll(id: string): Promise<Poll[]> {
  return normalizePolls(await api<Poll[]>('delete', { id }));
}

export type VoteResult = 'success' | 'already_voted' | 'closed' | 'not_found';

export async function castVote(
  pollId: string,
  optionIndex: number,
  deviceId: string
): Promise<{ result: VoteResult; polls?: Poll[] }> {
  const res = await api<{ result: VoteResult; polls?: Poll[] }>('vote', { pollId, optionIndex, deviceId });
  return { result: res.result, polls: res.polls ? normalizePolls(res.polls) : undefined };
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
