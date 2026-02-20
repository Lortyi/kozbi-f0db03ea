import { useState } from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Radio, Lock } from 'lucide-react';

const ADMIN_PIN = '2025';

interface PinGateProps {
  children: React.ReactNode;
}

export function PinGate({ children }: PinGateProps) {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem('admin_auth') === 'true'
  );
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleComplete = (value: string) => {
    if (value === ADMIN_PIN) {
      sessionStorage.setItem('admin_auth', 'true');
      setAuthenticated(true);
    } else {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 1500);
    }
  };

  if (authenticated) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border card-gradient p-8 text-center space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center glow-primary">
            <Lock className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">AKB Szavazó</h1>
            <p className="text-sm text-muted-foreground mt-1">Add meg a 4 jegyű PIN kódot</p>
          </div>
        </div>

        <div className="flex justify-center">
          <InputOTP
            maxLength={4}
            value={pin}
            onChange={setPin}
            onComplete={handleComplete}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} className={error ? 'border-destructive' : ''} />
              <InputOTPSlot index={1} className={error ? 'border-destructive' : ''} />
              <InputOTPSlot index={2} className={error ? 'border-destructive' : ''} />
              <InputOTPSlot index={3} className={error ? 'border-destructive' : ''} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        {error && (
          <p className="text-sm text-destructive font-medium">Hibás PIN kód</p>
        )}
      </div>
    </div>
  );
}
