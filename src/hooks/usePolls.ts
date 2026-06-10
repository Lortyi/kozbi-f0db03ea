import { useState, useCallback, useEffect } from 'react';
import { getPolls, createPoll, updatePollStatus, deletePoll, castVote, getDeviceId, type Poll, type VoteResult } from '@/lib/votingStore';

export function usePolls() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [deviceId] = useState<string>(getDeviceId());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await getPolls();
      setPolls(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ismeretlen hiba');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    // Szerver lekérdezése időközönként (valós idejű szinkron)
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, [refresh]);

  const handleCreate = useCallback(async (question: string, options: string[]) => {
    const data = await createPoll(question, options);
    setPolls(data);
    setError(null);
  }, []);

  const handleToggleStatus = useCallback(async (id: string, current: 'active' | 'closed') => {
    const data = await updatePollStatus(id, current === 'active' ? 'closed' : 'active');
    setPolls(data);
    setError(null);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    const data = await deletePoll(id);
    setPolls(data);
    setError(null);
  }, []);

  const handleVote = useCallback(async (pollId: string, optionIndex: number): Promise<VoteResult> => {
    const res = await castVote(pollId, optionIndex, deviceId);
    if (res.polls) setPolls(res.polls);
    else refresh();
    return res.result;
  }, [deviceId, refresh]);

  return { polls, deviceId, error, loading, refresh, handleCreate, handleToggleStatus, handleDelete, handleVote };
}
