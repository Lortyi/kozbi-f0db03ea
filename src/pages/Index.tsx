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
          <div className="flex justify-center">
            <Link
              to="/vote"
              className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg hover:opacity-90 transition-all glow-primary"
            >
              <Smartphone className="w-5 h-5" />
              Szavazóalkalmazás megnyitása
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Index;
