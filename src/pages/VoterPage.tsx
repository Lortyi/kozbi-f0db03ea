import { useState } from 'react';
import { usePolls } from '@/hooks/usePolls';
import { getTotalVotes } from '@/lib/votingStore';
import { CheckCircle2, Vote, ChevronRight, Clock, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VoterPage() {
  const { polls, deviceId, handleVote } = usePolls();
  const [voteResults, setVoteResults] = useState<Record<string, string>>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});

  const activePolls = polls.filter(p => p.status === 'active');
  const closedPolls = polls.filter(p => p.status === 'closed');

  const hasVoted = (pollId: string) => {
    const poll = polls.find(p => p.id === pollId);
    return poll?.deviceVotes.includes(deviceId) ?? false;
  };

  const submitVote = (pollId: string) => {
    const optionIndex = selectedOptions[pollId];
    if (optionIndex === undefined) return;
    const result = handleVote(pollId, optionIndex);
    setVoteResults(prev => ({ ...prev, [pollId]: result }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border glass sticky top-0 z-30">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center glow-primary">
              <Radio className="w-4 h-4 text-primary-foreground" />
            </div>
          <div>
              <h1 className="text-lg font-bold text-foreground leading-none">VotePulse</h1>
              <p className="text-xs text-muted-foreground">Szavazófülke</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 space-y-4">
        {activePolls.length === 0 && closedPolls.length === 0 ? (
          <div className="text-center py-24">
          <Vote className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Nincs elérhető szavazás</h2>
            <p className="text-muted-foreground">Nézz vissza később.</p>
          </div>
        ) : (
          <>
            {activePolls.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Aktív szavazások</p>
                <div className="space-y-4">
                  {activePolls.map(poll => {
                    const voted = hasVoted(poll.id) || voteResults[poll.id] === 'success' || voteResults[poll.id] === 'already_voted';
                    const total = getTotalVotes(poll);

                    return (
                      <div key={poll.id} className="rounded-2xl border border-border card-gradient overflow-hidden">
                        <div className="px-5 py-4 border-b border-border">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full status-active">● Aktív</span>
                            <span className="text-xs text-muted-foreground">{total} szavazat</span>
                          </div>
                          <h3 className="text-base font-semibold text-foreground">{poll.question}</h3>
                        </div>

                        <div className="px-5 py-4">
                          {voted ? (
                            <div className="flex items-center gap-3 py-4 justify-center text-center">
                              <CheckCircle2 className="w-8 h-8 text-[hsl(var(--status-active))] flex-shrink-0" />
                              <div>
                                <p className="font-semibold text-foreground">Szavazat rögzítve!</p>
                                <p className="text-sm text-muted-foreground">
                                  {voteResults[poll.id] === 'already_voted' ? 'Erre a szavazásra már szavaztál.' : 'Köszönjük a részvételt!'}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="space-y-2 mb-4">
                                {poll.options.map((option, i) => (
                                  <button
                                    key={i}
                                    onClick={() => setSelectedOptions(prev => ({ ...prev, [poll.id]: i }))}
                                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm font-medium ${
                                      selectedOptions[poll.id] === i
                                        ? 'border-primary bg-primary/10 text-foreground glow-primary'
                                        : 'border-border bg-muted/50 text-muted-foreground hover:text-foreground hover:border-border/80'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${
                                        selectedOptions[poll.id] === i
                                          ? 'border-primary bg-primary'
                                          : 'border-muted-foreground'
                                      }`} />
                                      {option}
                                    </div>
                                  </button>
                                ))}
                              </div>
                              <button
                                onClick={() => submitVote(poll.id)}
                                disabled={selectedOptions[poll.id] === undefined}
                                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed glow-primary"
                              >
                                Szavazás leadása <ChevronRight className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </>
        )}

        <p className="text-center text-xs text-muted-foreground pt-4">
          Eszközazonosító: <span className="font-mono">{deviceId.slice(0, 16)}…</span>
        </p>
      </main>
    </div>
  );
}
