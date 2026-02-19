import { useState } from 'react';
import { Plus, X, ChevronRight } from 'lucide-react';

interface CreatePollModalProps {
  onClose: () => void;
  onCreate: (question: string, options: string[]) => void;
}

export function CreatePollModal({ onClose, onCreate }: CreatePollModalProps) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [error, setError] = useState('');

  const addOption = () => {
    if (options.length < 6) setOptions([...options, '']);
  };

  const removeOption = (i: number) => {
    if (options.length > 2) setOptions(options.filter((_, idx) => idx !== i));
  };

  const updateOption = (i: number, val: string) => {
    const updated = [...options];
    updated[i] = val;
    setOptions(updated);
  };

  const handleSubmit = () => {
    if (!question.trim()) { setError('Please enter a question.'); return; }
    const validOptions = options.map(o => o.trim()).filter(Boolean);
    if (validOptions.length < 2) { setError('Please add at least 2 options.'); return; }
    onCreate(question.trim(), validOptions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-border card-gradient p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">New Poll</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Question</label>
            <input
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="What do you want to ask?"
              className="w-full rounded-xl bg-muted border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Options</label>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={opt}
                    onChange={e => updateOption(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    className="flex-1 rounded-xl bg-muted border border-border px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    maxLength={100}
                  />
                  {options.length > 2 && (
                    <button onClick={() => removeOption(i)} className="p-2.5 rounded-xl hover:bg-destructive/20 transition-colors">
                      <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 6 && (
              <button onClick={addOption} className="mt-2 flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors">
                <Plus className="w-4 h-4" /> Add option
              </button>
            )}
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <button
            onClick={handleSubmit}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity glow-primary"
          >
            Create Poll <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
