import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { useLabels } from '../hooks/useLabels';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { saveWalkIn, generateWalkInId } from '../services/ticketStorage';
import type { WalkIn, ChildInfo, ChildGender } from '../types';

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  );
}

function MinusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function NumberCounter({
  label,
  value,
  onChange,
  min = 0,
  max = 20,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex-1">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-center justify-center gap-3 bg-gray-50 rounded-lg p-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
          disabled={value <= min}
        >
          <MinusIcon className="w-5 h-5 text-gray-600" />
        </button>
        <span className="text-2xl font-semibold text-gray-900 w-8 text-center">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
          disabled={value >= max}
        >
          <PlusIcon className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
}

interface FormData {
  name: string;
  phoneNumber: string;
  adultCount: number;
  childCount: number;
  children: ChildInfo[];
}

interface FormErrors {
  name?: string;
  phoneNumber?: string;
  groupSize?: string;
}

export function WalkInPage() {
  const navigate = useNavigate();
  const { t } = useLabels();
  const { session } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    phoneNumber: '',
    adultCount: 1,
    childCount: 0,
    children: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [registeredWalkIn, setRegisteredWalkIn] = useState<WalkIn | null>(null);

  const groupSize = formData.adultCount + formData.childCount;

  // Sync children array with childCount
  useEffect(() => {
    setFormData((prev) => {
      const currentChildren = prev.children;
      const newCount = prev.childCount;

      if (newCount === currentChildren.length) {
        return prev;
      }

      if (newCount > currentChildren.length) {
        // Add new children with default values
        const newChildren = [...currentChildren];
        for (let i = currentChildren.length; i < newCount; i++) {
          newChildren.push({ age: 5, gender: 'boy' });
        }
        return { ...prev, children: newChildren };
      } else {
        // Remove excess children
        return { ...prev, children: currentChildren.slice(0, newCount) };
      }
    });
  }, [formData.childCount]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = t('fieldRequired');
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = t('fieldRequired');
    }

    if (groupSize < 1) {
      newErrors.groupSize = t('atLeastOnePerson');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const walkIn: WalkIn = {
      id: generateWalkInId(),
      name: formData.name.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      adultCount: formData.adultCount,
      childCount: formData.childCount,
      children: formData.childCount > 0 ? formData.children : undefined,
      totalCount: groupSize,
      checkedInAt: new Date().toISOString(),
      checkedInBy: session?.volunteerName || 'Unknown',
    };

    saveWalkIn(walkIn);
    setRegisteredWalkIn(walkIn);
  };

  const handleRegisterAnother = () => {
    setFormData({
      name: '',
      phoneNumber: '',
      adultCount: 1,
      childCount: 0,
      children: [],
    });
    setErrors({});
    setRegisteredWalkIn(null);
  };

  // Update a single child's info
  const updateChild = (index: number, field: keyof ChildInfo, value: number | ChildGender) => {
    setFormData((prev) => {
      const newChildren = [...prev.children];
      newChildren[index] = { ...newChildren[index], [field]: value };
      return { ...prev, children: newChildren };
    });
  };

  // Success screen
  if (registeredWalkIn) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />

        <main className="flex-1 p-6 max-w-lg mx-auto w-full flex flex-col justify-center">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-gray-900">{t('walkInSuccess')}</h1>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6 text-center">
            <h2 className="text-xl font-bold text-gray-900 uppercase mb-2">{registeredWalkIn.name}</h2>
            <p className="text-green-700 text-lg">
              {registeredWalkIn.totalCount} {registeredWalkIn.totalCount === 1 ? t('person') : t('people')}
            </p>
            <p className="text-gray-500 text-sm mt-2">
              {registeredWalkIn.adultCount} {t('adults')} • {registeredWalkIn.childCount} {t('children')}
            </p>
            <p className="text-gray-400 text-xs mt-2">ID: {registeredWalkIn.id}</p>
          </div>

          <div className="space-y-3">
            <Button fullWidth size="lg" onClick={handleRegisterAnother}>
              ➕ {t('registerAnother')}
            </Button>

            <Button fullWidth size="lg" variant="ghost" onClick={() => navigate('/')}>
              {t('back')}
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Form view
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 p-6 max-w-lg mx-auto w-full">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span className="font-medium">{t('back')}</span>
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('walkIn')}</h1>
        <p className="text-gray-500 mb-6">{t('walkInRegistration')}</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <Input
            label={t('name')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            placeholder="Familia Martinez"
            required
          />

          {/* Phone Number */}
          <Input
            label={t('phoneNumber')}
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            error={errors.phoneNumber}
            placeholder="(555) 222-3333"
            required
          />

          {/* Guest counts */}
          <div className="flex gap-4">
            <NumberCounter
              label={t('adults')}
              value={formData.adultCount}
              onChange={(value) => setFormData({ ...formData, adultCount: value })}
            />
            <NumberCounter
              label={t('children')}
              value={formData.childCount}
              onChange={(value) => setFormData({ ...formData, childCount: value })}
            />
          </div>

          {/* Children details for toy distribution */}
          {formData.childCount > 0 && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-800">{t('childDetails')}</h3>
                <p className="text-xs text-gray-500">{t('forToyDistribution')}</p>
              </div>
              <div className="space-y-3">
                {formData.children.map((child, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="text-xs font-medium text-gray-500 mb-2">
                      {t('childNumber')} {index + 1}
                    </div>
                    <div className="flex gap-3">
                      {/* Age selector */}
                      <div className="flex-1">
                        <label className="block text-xs text-gray-600 mb-1">{t('age')}</label>
                        <select
                          value={child.age}
                          onChange={(e) => updateChild(index, 'age', parseInt(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-svdp-blue-200 focus:border-svdp-blue"
                        >
                          {[...Array(18)].map((_, i) => (
                            <option key={i} value={i + 1}>
                              {i + 1} {t('years')}
                            </option>
                          ))}
                        </select>
                      </div>
                      {/* Gender selector */}
                      <div className="flex-1">
                        <label className="block text-xs text-gray-600 mb-1">{t('gender')}</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => updateChild(index, 'gender', 'boy')}
                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              child.gender === 'boy'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {t('boy')}
                          </button>
                          <button
                            type="button"
                            onClick={() => updateChild(index, 'gender', 'girl')}
                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              child.gender === 'girl'
                                ? 'bg-pink-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {t('girl')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total display */}
          <div className="text-center py-2 bg-svdp-blue-50 rounded-lg">
            <span className="text-svdp-blue-700 font-medium">
              {t('total')}: {groupSize} {groupSize === 1 ? t('person') : t('people')}
            </span>
            {errors.groupSize && <p className="text-sm text-red-600 mt-1">{errors.groupSize}</p>}
          </div>

          {/* Submit button */}
          <Button type="submit" fullWidth size="lg">
            ✓ {t('registerEntry')}
          </Button>
        </form>
      </main>
    </div>
  );
}
