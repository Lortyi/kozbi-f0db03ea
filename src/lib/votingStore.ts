// Voting data store - PHP/MySQL API backend (Apache)
export interface Poll {
  id: string;
  question: string;
  options: string[];
  status: 'active' | 'closed';
  votes: Record<string, number>; // option index -> count
  deviceVotes: string[]; // device IDs that have voted
  createdAt: number;
}

// API alapcím. Apache alatt az /api/index.php szolgálja ki.
// Felülírható .env-ben: VITE_API_BASE=https://domain.hu/api/index.php
const API_BASE = (import.meta.env.VITE_API_BASE as string) || '/api/index.php';

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
  const res = await fetch(`${API_BASE}?action=${action}`, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getPolls(): Promise<Poll[]> {
  try {
    return await api<Poll[]>('list');
  } catch {
    return [];
  }
}

export async function createPoll(question: string, options: string[]): Promise<Poll[]> {
  return api<Poll[]>('create', { question, options });
}

export async function updatePollStatus(id: string, status: 'active' | 'closed'): Promise<Poll[]> {
  return api<Poll[]>('status', { id, status });
}

export async function deletePoll(id: string): Promise<Poll[]> {
  return api<Poll[]>('delete', { id });
}

export type VoteResult = 'success' | 'already_voted' | 'closed' | 'not_found';

export async function castVote(
  pollId: string,
  optionIndex: number,
  deviceId: string
): Promise<{ result: VoteResult; polls?: Poll[] }> {
  return api<{ result: VoteResult; polls?: Poll[] }>('vote', { pollId, optionIndex, deviceId });
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
