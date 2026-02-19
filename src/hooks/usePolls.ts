import { useState, useCallback, useEffect } from 'react';
import { getPolls, savePolls, createPoll, updatePollStatus, deletePoll, castVote, getDeviceId, type Poll } from '@/lib/votingStore';

export function usePolls() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [deviceId] = useState<string>(getDeviceId());

  const refresh = useCallback(() => {
    setPolls(getPolls());
  }, []);

  useEffect(() => {
    refresh();
    // Poll for changes (simulating real-time sync)
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, [refresh]);

  const handleCreate = useCallback((question: string, options: string[]) => {
    const poll = createPoll(question, options);
    setPolls(getPolls());
    return poll;
  }, []);

  const handleToggleStatus = useCallback((id: string, current: 'active' | 'closed') => {
    updatePollStatus(id, current === 'active' ? 'closed' : 'active');
    setPolls(getPolls());
  }, []);

  const handleDelete = useCallback((id: string) => {
    deletePoll(id);
    setPolls(getPolls());
  }, []);

  const handleVote = useCallback((pollId: string, optionIndex: number) => {
    const result = castVote(pollId, optionIndex, deviceId);
    setPolls(getPolls());
    return result;
  }, [deviceId]);

  return { polls, deviceId, refresh, handleCreate, handleToggleStatus, handleDelete, handleVote };
}
