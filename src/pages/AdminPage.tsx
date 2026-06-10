import { useState } from 'react';
import { usePolls } from '@/hooks/usePolls';
import { getVoteData, getTotalVotes } from '@/lib/votingStore';
import { PollChart } from '@/components/PollChart';
import { CreatePollModal } from '@/components/CreatePollModal';
import { PinGate } from '@/components/PinGate';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Plus, BarChart2, CheckCircle2, XCircle, Trash2, Radio, LayoutGrid } from 'lucide-react';

export default function AdminPage() {
  const { polls, handleCreate, handleToggleStatus, handleDelete } = usePolls();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'chart'>('list');

  const selectedPoll = polls.find(p => p.id === selectedPollId) || polls[0];

  return (
    <ErrorBoundary>
    <PinGate>
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="no-print border-b border-border glass sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center glow-primary">
              <Radio className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground leading-none">AKB Szavazó</h1>
              <p className="text-xs text-muted-foreground">Admin irányítópult</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setView('list')}
                className={`px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors ${view === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Lista
              </button>
              <button
                onClick={() => setView('chart')}
                className={`px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors ${view === 'chart' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <BarChart2 className="w-3.5 h-3.5" /> Diagramok
              </button>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity glow-primary"
            >
              <Plus className="w-4 h-4" /> Új szavazás
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {polls.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <BarChart2 className="w-12 h-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Még nincs szavazás</h2>
            <p className="text-muted-foreground mb-6">Hozd létre az első szavazásodat a kezdéshez.</p>
            <button onClick={() => setShowCreate(true)} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-opacity">
              Szavazás létrehozása
            </button>
          </div>
        ) : view === 'list' ? (
          <div className="grid gap-4">
            {polls.map(poll => {
              const total = getTotalVotes(poll);
              return (
                <div key={poll.id} className="rounded-2xl border border-border card-gradient p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${poll.status === 'active' ? 'status-active' : 'status-closed'}`}>
                          {poll.status === 'active' ? '● Aktív' : '■ Lezárt'}
                        </span>
                        <span className="text-xs text-muted-foreground">{total} szavazat · {poll.options.length} lehetőség</span>
                      </div>
                      <h3 className="text-base font-semibold text-foreground">{poll.question}</h3>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {getVoteData(poll).slice(0, 3).map((d, i) => (
                          <span key={i} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-lg">
                            {d.option}: {d.votes}
                          </span>
                        ))}
                        {poll.options.length > 3 && (
                          <span className="text-xs text-muted-foreground px-2 py-1">+{poll.options.length - 3} more</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => { setSelectedPollId(poll.id); setView('chart'); }}
                        className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-primary"
                        title="Diagram megtekintése"
                      >
                        <BarChart2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(poll.id, poll.status)}
                        className="p-2 rounded-xl hover:bg-secondary transition-colors"
                        title={poll.status === 'active' ? 'Szavazás lezárása' : 'Szavazás újranyitása'}
                      >
                        {poll.status === 'active'
                          ? <XCircle className="w-4 h-4 text-destructive" />
                          : <CheckCircle2 className="w-4 h-4 text-green-400" />
                        }
                      </button>
                      <button
                        onClick={() => handleDelete(poll.id)}
                        className="p-2 rounded-xl hover:bg-destructive/20 transition-colors"
                        title="Szavazás törlése"
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Chart view */
          <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
            {/* Poll selector sidebar */}
            <div className="no-print space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Szavazás kiválasztása</p>
              {polls.map(poll => (
                <button
                  key={poll.id}
                  onClick={() => setSelectedPollId(poll.id)}
                  className={`w-full text-left rounded-xl px-4 py-3 transition-all border ${
                    (selectedPollId === poll.id || (!selectedPollId && poll.id === polls[0]?.id))
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border card-gradient text-muted-foreground hover:text-foreground hover:border-border/80'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${poll.status === 'active' ? 'status-active' : 'status-closed'}`}>
                      {poll.status === 'active' ? '●' : '■'}
                    </span>
                    <span className="text-xs text-muted-foreground">{getTotalVotes(poll)} szavazat</span>
                  </div>
                  <p className="text-sm font-medium line-clamp-2">{poll.question}</p>
                </button>
              ))}
            </div>

            {/* Chart display */}
            {selectedPoll && (
              <div className="rounded-2xl border border-border card-gradient p-6 print-card">
                <div className="flex items-center gap-2 mb-4 no-print">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${selectedPoll.status === 'active' ? 'status-active' : 'status-closed'}`}>
                    {selectedPoll.status === 'active' ? '● Aktív' : '■ Lezárt'}
                  </span>
                  <button
                    onClick={() => handleToggleStatus(selectedPoll.id, selectedPoll.status)}
                    className="ml-auto text-xs px-3 py-1 rounded-lg border border-border hover:bg-secondary transition-colors text-muted-foreground"
                  >
                    {selectedPoll.status === 'active' ? 'Szavazás lezárása' : 'Szavazás újranyitása'}
                  </button>
                </div>
                <PollChart poll={selectedPoll} showPrint />
              </div>
            )}
          </div>
        )}
      </main>

      {showCreate && (
        <CreatePollModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
    </PinGate>
  );
}
