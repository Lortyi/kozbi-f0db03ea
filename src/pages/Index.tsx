import heroImage from '@/assets/hero-voting.jpg';
import { Link } from 'react-router-dom';
import { Radio, Smartphone, Monitor, ChevronRight } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-16 text-center overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center glow-primary">
              <Radio className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground glow-text">VotePulse</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-4 leading-tight">
            Real-time voting
            <br />
            <span className="text-primary glow-text">across all devices</span>
          </h1>

          <p className="text-lg text-muted-foreground mb-10 max-w-lg mx-auto">
            Create polls, collect votes from any device, and visualize results instantly with live charts.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/vote"
              className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg hover:opacity-90 transition-all glow-primary"
            >
              <Smartphone className="w-5 h-5" />
              Open Voter App
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              to="/admin"
              className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl border border-border bg-secondary text-secondary-foreground font-bold text-lg hover:bg-secondary/80 transition-all"
            >
              <Monitor className="w-5 h-5" />
              Admin Dashboard
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Feature strip */}
      <div className="border-t border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: '🛡️', title: 'Anti-double vote', desc: 'Each device can only vote once per poll using a unique device fingerprint.' },
            { icon: '📊', title: 'Live charts', desc: 'Bar charts update in real-time. Print results directly from the dashboard.' },
            { icon: '🎛️', title: 'Session control', desc: 'Instantly open or close any poll. Full admin control from one dashboard.' },
          ].map(f => (
            <div key={f.title} className="flex gap-3">
              <span className="text-2xl flex-shrink-0">{f.icon}</span>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
