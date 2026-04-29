import * as React from 'react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Calendar, User, Mail, Phone, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';

interface Week {
  id: string;
  label: string;
  dates: string;
  status: 'open' | 'full' | 'closed';
  booked: number;
  capacity: number;
}

const schema = z.object({
  client_name: z.string().min(2, 'Please enter your full name'),
  spouse_name: z.string().optional(),
  client_email: z.string().email('Please enter a valid email address'),
  client_phone: z.string().optional(),
  upload_week: z.string().min(1, 'Please select an upload week'),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const ReservationForm: React.FC = () => {
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const watchedWeek = watch('upload_week');

  useEffect(() => {
    const fetchWeeks = async () => {
      try {
        const res = await axios.get('/api/taskade/projects/TVHrWGZvBpk1tY9Y/nodes');
        const nodes = res.data?.payload?.nodes ?? [];
        const mapped: Week[] = nodes
          .filter((n: any) => n.parentId !== null && n.fieldValues?.['/text'])
          .map((n: any) => {
            const statusMap: Record<string, 'open' | 'full' | 'closed'> = {
              'wk-open': 'open',
              'wk-full': 'full',
              'wk-closed': 'closed',
            };
            const statusRaw = n.fieldValues?.['/attributes/@wkSts'] ?? 'wk-open';
            return {
              id: n.id,
              label: n.fieldValues?.['/text'] ?? '',
              dates: n.fieldValues?.['/attributes/@wkDt'] ?? '',
              status: statusMap[statusRaw] ?? 'open',
              booked: Number(n.fieldValues?.['/attributes/@wkBkd'] ?? 0),
              capacity: Number(n.fieldValues?.['/attributes/@wkCap'] ?? 10),
            };
          });
        setWeeks(mapped);
      } catch {
        setWeeks([
          { id: '1', label: 'Week 1: Mar 31 – Apr 4', dates: 'Mar 31 – Apr 4, 2025', status: 'open', booked: 7, capacity: 10 },
          { id: '2', label: 'Week 2: Apr 7 – Apr 11', dates: 'Apr 7 – Apr 11, 2025', status: 'full', booked: 10, capacity: 10 },
          { id: '3', label: 'Week 3: Apr 14 – Apr 18', dates: 'Apr 14 – Apr 18, 2025', status: 'open', booked: 4, capacity: 10 },
          { id: '4', label: 'Week 4: Apr 21 – Apr 25', dates: 'Apr 21 – Apr 25, 2025', status: 'open', booked: 3, capacity: 10 },
          { id: '5', label: 'Week 5: Apr 28 – May 2', dates: 'Apr 28 – May 2, 2025', status: 'open', booked: 1, capacity: 10 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchWeeks();
  }, []);

  const handleWeekSelect = (week: Week) => {
    if (week.status !== 'open') return;
    setSelectedWeek(week);
    setValue('upload_week', week.dates);
  };

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    setSubmitError('');
    try {
      await axios.post('/api/taskade/webhooks/01KQDBJQK1R2AXCMNAX1VETAQB/run', {
        client_name: data.client_name,
        spouse_name: data.spouse_name ?? '',
        client_email: data.client_email,
        client_phone: data.client_phone ?? '',
        upload_week: data.upload_week,
        notes: data.notes ?? '',
      });
      setSubmitted(true);
    } catch {
      setSubmitError('Something went wrong. Please try again or contact us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    const PAYMENT_LINK = 'https://secure.cpacharge.com/pages/victoriatax/payments?utm_medium=email';
    const DEPOSIT_AMOUNT = '$260';

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-[80vh] flex items-center justify-center px-6"
      >
        <div className="text-center max-w-md w-full">
          {/* Gold checkmark ring */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border-4"
            style={{ borderColor: '#f9ec00', background: 'rgba(249,236,0,0.08)' }}
          >
            <CheckCircle className="w-9 h-9" style={{ color: '#f9ec00' }} />
          </motion.div>

          <h2 className="text-2xl font-bold mb-2">You're Reserved!</h2>
          <p className="text-muted-foreground mb-8">
            Your spot is held. Complete your <strong>{DEPOSIT_AMOUNT} deposit</strong> now to fully confirm your upload week.
          </p>

          {/* Pay button — navy with gold accent */}
          <motion.a
            href={PAYMENT_LINK}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-lg font-bold text-base transition-all duration-200 mb-4"
            style={{ background: '#1a2d5a', color: '#fff', boxShadow: '0 4px 24px rgba(26,45,90,0.25)' }}
          >
            <span className="text-lg">💳</span>
            Pay {DEPOSIT_AMOUNT} Deposit Now
            <ChevronRight className="w-5 h-5" style={{ color: '#f9ec00' }} />
          </motion.a>

          {/* 48-hour notice bar — gold */}
          <div
            className="rounded-lg p-4 text-sm mb-6 text-left border"
            style={{ background: 'rgba(249,236,0,0.07)', borderColor: 'rgba(249,236,0,0.35)', color: 'inherit' }}
          >
            <strong>⚠️ Important:</strong> Your reservation is <strong>not confirmed</strong> until the {DEPOSIT_AMOUNT} deposit is received. Please complete payment within <strong>48 hours</strong>.
          </div>

          <p className="text-xs text-muted-foreground mb-6">
            You'll be taken to our secure CPACharge payment page. Your deposit goes directly toward your tax preparation fee.
          </p>

          <button
            onClick={() => { setSubmitted(false); setSelectedWeek(null); }}
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
          >
            Book another slot
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        {/* Gold accent line */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-[2px] w-8 rounded-full" style={{ backgroundColor: '#f9ec00' }} />
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-semibold tracking-widest uppercase rounded-full"
            style={{ background: 'rgba(249,236,0,0.12)', color: 'inherit', border: '1px solid rgba(249,236,0,0.3)' }}
          >
            <Calendar className="w-3.5 h-3.5" style={{ color: '#f9ec00' }} />
            Tax Season 2027
          </div>
          <div className="h-[2px] w-8 rounded-full" style={{ backgroundColor: '#f9ec00' }} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Reserve Your Upload Week
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Secure your dedicated window to submit tax documents to Victoria Nguyen, EA. Spots are limited — book early.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3"
        >
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Select Your Week
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-muted/50 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {weeks.map((week) => {
                const isSelected = watchedWeek === week.dates;
                const isFull = week.status === 'full';
                const isClosed = week.status === 'closed';
                const isDisabled = isFull || isClosed;
                const spotsLeft = week.capacity - week.booked;
                const fillPct = (week.booked / week.capacity) * 100;

                return (
                  <motion.button
                    key={week.id}
                    whileHover={isDisabled ? {} : { scale: 1.01 }}
                    whileTap={isDisabled ? {} : { scale: 0.99 }}
                    onClick={() => handleWeekSelect(week)}
                    disabled={isDisabled}
                    className={cn(
                      'w-full text-left p-4 rounded-xl border transition-all duration-200 relative overflow-hidden',
                      isSelected
                        ? 'shadow-lg'
                        : isDisabled
                        ? 'border-border/30 bg-muted/20 opacity-50 cursor-not-allowed'
                        : 'border-border/50 bg-card hover:bg-card/80 cursor-pointer'
                    )}
                    style={
                      isSelected
                        ? { borderColor: '#1a2d5a', background: 'rgba(26,45,90,0.07)', boxShadow: '0 4px 16px rgba(26,45,90,0.12)' }
                        : !isDisabled
                        ? undefined
                        : undefined
                    }
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-semibold text-sm">{week.label}</div>
                        <div className="text-xs text-muted-foreground">{week.dates}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isFull ? (
                          <span className="text-xs bg-red-500/15 text-red-500 px-2 py-0.5 rounded-full font-medium">Full</span>
                        ) : isClosed ? (
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">Closed</span>
                        ) : (
                          <span className="text-xs bg-emerald-500/15 text-emerald-500 px-2 py-0.5 rounded-full font-medium">
                            {spotsLeft} left
                          </span>
                        )}
                        {isSelected && <CheckCircle className="w-4 h-4" style={{ color: '#1a2d5a' }} />}
                      </div>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          isFull ? 'bg-red-500' : fillPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                        )}
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
          {errors.upload_week && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.upload_week.message}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2"
        >
          <div className="bg-card border border-border/50 rounded-2xl p-6 sticky top-24">
            <h2 className="font-semibold mb-5 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Your Details
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wide">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    {...register('client_name')}
                    placeholder="Jane Smith"
                    className={cn(
                      'w-full pl-10 pr-4 py-2.5 bg-background border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50',
                      errors.client_name ? 'border-red-500' : 'border-border/50'
                    )}
                  />
                </div>
                {errors.client_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.client_name.message}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wide">
                  Spouse / Partner Name <span className="normal-case tracking-normal font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    {...register('spouse_name')}
                    placeholder="Spouse or partner's full name"
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-border/50 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wide">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    {...register('client_email')}
                    type="email"
                    placeholder="jane@example.com"
                    className={cn(
                      'w-full pl-10 pr-4 py-2.5 bg-background border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50',
                      errors.client_email ? 'border-red-500' : 'border-border/50'
                    )}
                  />
                </div>
                {errors.client_email && (
                  <p className="text-red-500 text-xs mt-1">{errors.client_email.message}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wide">
                  Phone (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    {...register('client_phone')}
                    type="tel"
                    placeholder="(555) 000-0000"
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-border/50 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wide">
                  Notes (Optional)
                </label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  placeholder="e.g. Self-employed, LLC, multiple W-2s..."
                  className="w-full px-4 py-2.5 bg-background border border-border/50 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>

              <AnimatePresence>
                {selectedWeek && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-lg px-4 py-3 text-sm border"
                    style={{ background: 'rgba(249,236,0,0.08)', borderColor: 'rgba(249,236,0,0.35)' }}
                  >
                    <div className="text-xs text-muted-foreground mb-0.5">Selected week</div>
                    <div className="font-semibold text-foreground">{selectedWeek.dates}</div>
                  </motion.div>
                )}
              </AnimatePresence>

              {submitError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-500 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm hover:opacity-90 active:scale-[0.99] transition-all duration-200 disabled:opacity-60"
                style={{ background: '#1a2d5a', color: '#fff' }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Reserving...
                  </>
                ) : (
                  <>
                    Reserve My Spot
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-xs text-muted-foreground text-center">
                After reserving, you'll be directed to pay the <strong>$260 deposit</strong> via CPACharge to confirm your spot.
              </p>
            </form>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-12 bg-card border border-border/50 rounded-2xl p-6"
      >
        <h3 className="font-semibold mb-4">📋 What to Prepare for Your Upload Week</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { icon: '📄', label: 'W-2 Forms', desc: 'From all employers this year' },
            { icon: '🧾', label: '1099 Forms', desc: 'Freelance, dividends, interest' },
            { icon: '🏦', label: 'Bank Statements', desc: 'Business accounts, savings' },
            { icon: '🧳', label: 'Business Receipts', desc: 'Deductible expenses' },
            { icon: '📁', label: 'Prior Year Return', desc: 'Last year\'s tax filing' },
            { icon: '🏠', label: 'Property Docs', desc: 'Mortgage interest, rent' },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <span className="text-xl">{item.icon}</span>
              <div>
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ReservationForm;
