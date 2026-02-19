// Voting data store using localStorage for persistence
export interface Poll {
  id: string;
  question: string;
  options: string[];
  status: 'active' | 'closed';
  votes: Record<string, number>; // option index -> count
  deviceVotes: string[]; // device IDs that have voted
  createdAt: number;
}

const POLLS_KEY = 'votepulse_polls';
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

export function getPolls(): Poll[] {
  try {
    const raw = localStorage.getItem(POLLS_KEY);
    return raw ? JSON.parse(raw) : getDefaultPolls();
  } catch {
    return getDefaultPolls();
  }
}

function getDefaultPolls(): Poll[] {
  const defaults: Poll[] = [
    {
      id: 'poll_demo_1',
      question: 'What is your preferred remote work arrangement?',
      options: ['Full remote', 'Hybrid (3 days office)', 'Hybrid (2 days office)', 'Full office'],
      status: 'active',
      votes: { '0': 12, '1': 28, '2': 19, '3': 7 },
      deviceVotes: [],
      createdAt: Date.now() - 86400000,
    },
    {
      id: 'poll_demo_2',
      question: 'Which project should we prioritize next quarter?',
      options: ['New mobile app', 'Platform redesign', 'API improvements', 'Analytics dashboard'],
      status: 'closed',
      votes: { '0': 34, '1': 22, '2': 41, '3': 18 },
      deviceVotes: [],
      createdAt: Date.now() - 172800000,
    },
  ];
  savePolls(defaults);
  return defaults;
}

export function savePolls(polls: Poll[]): void {
  localStorage.setItem(POLLS_KEY, JSON.stringify(polls));
}

export function getPoll(id: string): Poll | undefined {
  return getPolls().find((p) => p.id === id);
}

export function createPoll(question: string, options: string[]): Poll {
  const poll: Poll = {
    id: `poll_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    question,
    options,
    status: 'active',
    votes: {},
    deviceVotes: [],
    createdAt: Date.now(),
  };
  const polls = getPolls();
  polls.unshift(poll);
  savePolls(polls);
  return poll;
}

export function updatePollStatus(id: string, status: 'active' | 'closed'): void {
  const polls = getPolls();
  const idx = polls.findIndex((p) => p.id === id);
  if (idx !== -1) {
    polls[idx].status = status;
    savePolls(polls);
  }
}

export function deletePoll(id: string): void {
  const polls = getPolls().filter((p) => p.id !== id);
  savePolls(polls);
}

export function castVote(pollId: string, optionIndex: number, deviceId: string): 'success' | 'already_voted' | 'closed' | 'not_found' {
  const polls = getPolls();
  const idx = polls.findIndex((p) => p.id === pollId);
  if (idx === -1) return 'not_found';
  const poll = polls[idx];
  if (poll.status === 'closed') return 'closed';
  if (poll.deviceVotes.includes(deviceId)) return 'already_voted';

  poll.votes[optionIndex.toString()] = (poll.votes[optionIndex.toString()] || 0) + 1;
  poll.deviceVotes.push(deviceId);
  savePolls(polls);
  return 'success';
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
