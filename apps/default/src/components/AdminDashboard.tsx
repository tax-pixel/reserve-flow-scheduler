import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, CheckCircle, Clock, XCircle, LayoutDashboard, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';

interface Reservation {
  id: string;
  name: string;
  email: string;
  phone: string;
  week: string;
  paymentStatus: 'pay-pending' | 'pay-paid' | 'pay-failed';
  reservationStatus: 'res-new' | 'res-confirmed' | 'res-cancelled';
  notes: string;
  submittedAt: string;
}

const paymentLabel: Record<string, { label: string; color: string }> = {
  'pay-pending': { label: 'Pending', color: 'text-amber-500 bg-amber-500/10' },
  'pay-paid': { label: 'Paid', color: 'text-emerald-500 bg-emerald-500/10' },
  'pay-failed': { label: 'Failed', color: 'text-red-500 bg-red-500/10' },
};

const statusLabel: Record<string, { label: string; color: string }> = {
  'res-new': { label: 'New', color: 'text-indigo-500 bg-indigo-500/10' },
  'res-confirmed': { label: 'Confirmed', color: 'text-emerald-500 bg-emerald-500/10' },
  'res-cancelled': { label: 'Cancelled', color: 'text-red-500 bg-red-500/10' },
};

const AdminDashboard: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReservations = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await axios.get('/api/taskade/projects/zRxJcLi6EcsFdA3Z/nodes');
      const nodes = res.data?.payload?.nodes ?? [];
      const mapped: Reservation[] = nodes
        .filter((n: any) => n.parentId !== null && n.fieldValues?.['/text'])
        .map((n: any) => ({
          id: n.id,
          name: n.fieldValues?.['/attributes/@rfNam'] ?? n.fieldValues?.['/text'] ?? 'Unknown',
          email: n.fieldValues?.['/attributes/@rfEml'] ?? '',
          phone: n.fieldValues?.['/attributes/@rfPhn'] ?? '',
          week: n.fieldValues?.['/attributes/@rfWkS'] ?? '',
          paymentStatus: n.fieldValues?.['/attributes/@rfPay'] ?? 'pay-pending',
          reservationStatus: n.fieldValues?.['/attributes/@rfSts'] ?? 'res-new',
          notes: n.fieldValues?.['/attributes/@rfNts'] ?? '',
          submittedAt: n.fieldValues?.['/attributes/@rfDt'] ?? '',
        }));
      setReservations(mapped);
    } catch {
      // Keep empty
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const totalReservations = reservations.length;
  const paidCount = reservations.filter((r) => r.paymentStatus === 'pay-paid').length;
  const pendingCount = reservations.filter((r) => r.paymentStatus === 'pay-pending').length;
  const confirmedCount = reservations.filter((r) => r.reservationStatus === 'res-confirmed').length;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold">Reservations Dashboard</h1>
          </div>
          <p className="text-muted-foreground text-sm">Manage all client upload week bookings</p>
        </div>
        <button
          onClick={() => fetchReservations(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border/50 text-sm hover:bg-muted transition-colors disabled:opacity-60"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', refreshing && 'animate-spin')} />
          Refresh
        </button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Bookings', value: totalReservations, icon: Users, color: 'text-primary' },
          { label: 'Confirmed', value: confirmedCount, icon: CheckCircle, color: 'text-emerald-500' },
          { label: 'Payment Pending', value: pendingCount, icon: Clock, color: 'text-amber-500' },
          { label: 'Paid', value: paidCount, icon: Calendar, color: 'text-blue-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border/50 rounded-xl p-5"
          >
            <div className={cn('mb-2', stat.color)}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold mb-0.5">
              {loading ? <div className="h-7 w-8 bg-muted/50 rounded animate-pulse" /> : stat.value}
            </div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border/50 rounded-2xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
          <h2 className="font-semibold">All Reservations</h2>
          <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
            {totalReservations} total
          </span>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 bg-muted/30 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : reservations.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No reservations yet</p>
            <p className="text-xs mt-1">Share the booking form with your clients</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30">
                  {['Client', 'Email', 'Upload Week', 'Payment', 'Status', 'Notes'].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-muted-foreground px-6 py-3 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reservations.map((r, i) => {
                  const pay = paymentLabel[r.paymentStatus] ?? paymentLabel['pay-pending'];
                  const sts = statusLabel[r.reservationStatus] ?? statusLabel['res-new'];
                  return (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-sm">{r.name}</div>
                        {r.phone && <div className="text-xs text-muted-foreground">{r.phone}</div>}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{r.email}</td>
                      <td className="px-6 py-4 text-sm">{r.week}</td>
                      <td className="px-6 py-4">
                        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', pay.color)}>
                          {pay.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', sts.color)}>
                          {sts.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground max-w-[180px] truncate">
                        {r.notes || '—'}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
