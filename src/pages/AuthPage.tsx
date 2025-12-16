import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { PinInput } from '../components/ui/PinInput';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useLabels } from '../hooks/useLabels';
import { useLanguage } from '../hooks/useLanguage';

export function AuthPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLabels();
  const { language, setLanguage } = useLanguage();

  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [errors, setErrors] = useState<{ name?: string; pin?: string }>({});

  const validate = (): boolean => {
    const newErrors: { name?: string; pin?: string } = {};

    if (!name.trim()) {
      newErrors.name = t('nameRequired');
    } else if (name.trim().length < 2) {
      newErrors.name = t('nameTooShort');
    }

    if (!pin) {
      newErrors.pin = t('pinRequired');
    } else if (pin.length !== 4) {
      newErrors.pin = t('pinMustBe4Digits');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    const result = await login(name, pin);
    setIsLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setErrors({ pin: t('invalidPin') });
      setPin('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-svdp-blue-50 to-white">
      <div className="w-full max-w-md">
        {/* Language Toggle */}
        <div className="flex justify-center mb-6">
          <div className="flex rounded-lg bg-white shadow p-1">
            <button
              onClick={() => setLanguage('es')}
              className={`py-1.5 px-4 rounded-md text-sm font-medium transition-colors ${
                language === 'es'
                  ? 'bg-svdp-blue text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Español
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`py-1.5 px-4 rounded-md text-sm font-medium transition-colors ${
                language === 'en'
                  ? 'bg-svdp-blue text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Header with Logo */}
        <div className="text-center mb-8">
          <img
            src="/svdp-logo.png"
            alt="SVDP Guadalupe Conference"
            className="h-24 object-contain mx-auto mb-4"
          />
          <h1 className="text-xl font-bold text-svdp-blue mb-1">{t('eventSubtitle')}</h1>
          <p className="text-gray-500 text-sm">{t('eventDate')}</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          <Input
            label={t('enterName')}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Maria Santos"
            error={errors.name}
            autoComplete="name"
            autoFocus
          />

          <PinInput
            label={t('enterPin')}
            value={pin}
            onChange={setPin}
            error={errors.pin}
          />

          <Button type="submit" size="lg" fullWidth disabled={isLoading}>
            {isLoading ? '...' : t('continue')}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          St. Vincent de Paul - Guadalupe Conference
        </p>
      </div>
    </div>
  );
}
