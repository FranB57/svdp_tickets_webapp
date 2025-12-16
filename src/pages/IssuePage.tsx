import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { useLabels } from '../hooks/useLabels';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { TicketPreview } from '../components/ticket/TicketPreview';
import { generateTicketPdf } from '../utils/generateTicketPdf';
import { saveTicket } from '../services/ticketStorage';
import type { Ticket, ChildInfo, ChildGender } from '../types';

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

// Generate a simple unique ID (8 characters)
function generateTicketId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

interface FormData {
  recipientName: string;
  phoneNumber: string;
  email: string;
  adultCount: number;
  childCount: number;
  children: ChildInfo[];
  specialNeeds: string;
  rsvpStatus: 'confirmed' | 'declined';
}

interface FormErrors {
  recipientName?: string;
  phoneNumber?: string;
  email?: string;
  groupSize?: string;
}

// Number counter component
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

export function IssuePage() {
  const navigate = useNavigate();
  const { t } = useLabels();
  const { session } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    recipientName: '',
    phoneNumber: '',
    email: '',
    adultCount: 1,
    childCount: 0,
    children: [],
    specialNeeds: '',
    rsvpStatus: 'confirmed',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null);

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

    if (!formData.recipientName.trim() || formData.recipientName.trim().length < 2) {
      newErrors.recipientName = t('fieldRequired');
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = t('fieldRequired');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('fieldRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('invalidEmail');
    }

    if (groupSize < 1) {
      newErrors.groupSize = t('atLeastOnePerson');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted, validating...');

    if (!validateForm()) {
      console.log('Validation failed:', errors);
      return;
    }

    // Create the ticket object
    const ticket: Ticket = {
      id: generateTicketId(),
      recipientName: formData.recipientName.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      email: formData.email.trim(),
      adultCount: formData.adultCount,
      childCount: formData.childCount,
      children: formData.childCount > 0 ? formData.children : undefined,
      groupSize: groupSize,
      specialNeeds: formData.specialNeeds.trim() || undefined,
      rsvpStatus: formData.rsvpStatus,
      status: 'issued',
      createdAt: new Date().toISOString(),
      createdBy: session?.volunteerName || 'Unknown',
    };

    // QR payload structure (for future use)
    const qrPayload = {
      id: ticket.id,
      n: ticket.recipientName.substring(0, 30),
      g: ticket.groupSize,
      v: 1,
    };

    // Save ticket to storage
    saveTicket(ticket);

    // Log the ticket and QR payload to console
    console.log('%c=== TICKET CREATED ===', 'background: #006BA8; color: white; font-size: 16px; padding: 4px;');
    console.log('Ticket JSON:');
    console.log(ticket);
    console.log('QR Payload:');
    console.log(qrPayload);
    console.log('%c======================', 'background: #006BA8; color: white; font-size: 16px; padding: 4px;');

    setCreatedTicket(ticket);
  };

  const handleCreateAnother = () => {
    setFormData({
      recipientName: '',
      phoneNumber: '',
      email: '',
      adultCount: 1,
      childCount: 0,
      children: [],
      specialNeeds: '',
      rsvpStatus: 'confirmed',
    });
    setErrors({});
    setCreatedTicket(null);
  };

  // Update a single child's info
  const updateChild = (index: number, field: keyof ChildInfo, value: number | ChildGender) => {
    setFormData((prev) => {
      const newChildren = [...prev.children];
      newChildren[index] = { ...newChildren[index], [field]: value };
      return { ...prev, children: newChildren };
    });
  };

  // Success screen after ticket creation
  if (createdTicket) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />

        <main className="flex-1 p-6 max-w-lg mx-auto w-full">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🎉</div>
            <h1 className="text-2xl font-bold text-gray-900">{t('ticketCreated')}</h1>
          </div>

          <TicketPreview ticket={createdTicket} />

          <div className="mt-6 space-y-3">
            <Button
              fullWidth
              size="lg"
              variant="primary"
              onClick={() => generateTicketPdf(createdTicket)}
            >
              📥 {t('downloadPdf')}
            </Button>

            <Button fullWidth size="lg" variant="outline" onClick={handleCreateAnother}>
              ➕ {t('createAnother')}
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

        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('issueTicket')}</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Recipient Name */}
          <Input
            label={t('recipientName')}
            value={formData.recipientName}
            onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
            error={errors.recipientName}
            placeholder="Familia Garcia"
            required
          />

          {/* Phone Number */}
          <Input
            label={t('phoneNumber')}
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            error={errors.phoneNumber}
            placeholder="(555) 123-4567"
            required
          />

          {/* Email */}
          <Input
            label={t('emailAddress')}
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            placeholder="garcia@email.com"
            required
          />

          {/* Guest counts */}
          <div className="flex gap-4">
            <NumberCounter
              label={t('numberOfAdults')}
              value={formData.adultCount}
              onChange={(value) => setFormData({ ...formData, adultCount: value })}
            />
            <NumberCounter
              label={t('numberOfChildren')}
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
              {t('total')}: {groupSize} {groupSize === 1 ? t('guest') : t('guests')}
            </span>
            {errors.groupSize && <p className="text-sm text-red-600 mt-1">{errors.groupSize}</p>}
          </div>

          {/* Special needs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('specialNeeds')}</label>
            <textarea
              value={formData.specialNeeds}
              onChange={(e) => setFormData({ ...formData, specialNeeds: e.target.value })}
              placeholder={t('specialNeedsPlaceholder')}
              rows={2}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-svdp-blue focus:ring-svdp-blue-200"
            />
          </div>

          {/* RSVP Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('rsvpStatus')}</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="rsvpStatus"
                  value="confirmed"
                  checked={formData.rsvpStatus === 'confirmed'}
                  onChange={() => setFormData({ ...formData, rsvpStatus: 'confirmed' })}
                  className="w-5 h-5 text-svdp-blue focus:ring-svdp-blue"
                />
                <span className="text-gray-900">{t('confirmed')}</span>
              </label>
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="rsvpStatus"
                  value="declined"
                  checked={formData.rsvpStatus === 'declined'}
                  onChange={() => setFormData({ ...formData, rsvpStatus: 'declined' })}
                  className="w-5 h-5 text-svdp-blue focus:ring-svdp-blue"
                />
                <span className="text-gray-900">{t('declined')}</span>
              </label>
            </div>
          </div>

          {/* Submit button */}
          <Button type="submit" fullWidth size="lg">
            ✓ {t('createTicket')}
          </Button>
        </form>
      </main>
    </div>
  );
}
