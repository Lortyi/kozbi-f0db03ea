import { useState, useCallback, useEffect } from 'react';
import { getPolls, createPoll, updatePollStatus, deletePoll, castVote, getDeviceId, type Poll, type VoteResult } from '@/lib/votingStore';

export function usePolls() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [deviceId] = useState<string>(getDeviceId());

  const refresh = useCallback(async () => {
    const data = await getPolls();
    setPolls(data);
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
  }, []);

  const handleToggleStatus = useCallback(async (id: string, current: 'active' | 'closed') => {
    const data = await updatePollStatus(id, current === 'active' ? 'closed' : 'active');
    setPolls(data);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    const data = await deletePoll(id);
    setPolls(data);
  }, []);

  const handleVote = useCallback(async (pollId: string, optionIndex: number): Promise<VoteResult> => {
    const res = await castVote(pollId, optionIndex, deviceId);
    if (res.polls) setPolls(res.polls);
    else refresh();
    return res.result;
  }, [deviceId, refresh]);

  return { polls, deviceId, refresh, handleCreate, handleToggleStatus, handleDelete, handleVote };
}
