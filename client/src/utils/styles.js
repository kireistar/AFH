export const TIER_STYLES = {
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  High: 'bg-red-50 text-[#B91C1C] border-red-200',
};

export const tierRank = (tier) => {
  const value = String(tier || '').trim().toLowerCase();
  if (value === 'high') return 3;
  if (value === 'medium') return 2;
  return 1; // 'low' or unknown → lowest
};

export const STATUS_BADGES = {
  pending_admin: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  pending_manager: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  awaiting: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  open: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  unpaid: 'bg-yellow-50 text-yellow-700 border-yellow-200',

  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  committed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  on_time: 'bg-emerald-50 text-emerald-700 border-emerald-200',

  rejected: 'bg-red-50 text-[#B91C1C] border-red-200',
  denied: 'bg-red-50 text-[#B91C1C] border-red-200',
  failed: 'bg-red-50 text-[#B91C1C] border-red-200',
  tampered: 'bg-red-50 text-[#B91C1C] border-red-200',
  lost: 'bg-red-50 text-[#B91C1C] border-red-200',
  retired: 'bg-red-50 text-[#B91C1C] border-red-200',
  broken: 'bg-red-50 text-[#B91C1C] border-red-200',
  damaged: 'bg-red-50 text-[#B91C1C] border-red-200',

  handed_over: 'bg-blue-50 text-[#1E3A8A] border-blue-200',
  borrowed: 'bg-blue-50 text-[#1E3A8A] border-blue-200',
  in_use: 'bg-blue-50 text-[#1E3A8A] border-blue-200',
  investigating: 'bg-blue-50 text-[#1E3A8A] border-blue-200',
  pending_verification: 'bg-blue-50 text-[#1E3A8A] border-blue-200',

  maintenance: 'bg-amber-50 text-amber-700 border-amber-200',
  maintenanced: 'bg-amber-50 text-amber-700 border-amber-200',
  repairing: 'bg-amber-50 text-amber-700 border-amber-200',
  overdue: 'bg-amber-50 text-amber-700 border-amber-200',
  terminated: 'bg-amber-50 text-amber-700 border-amber-200',

  returned: 'bg-slate-100 text-slate-600 border-slate-300',
  cancelled: 'bg-slate-100 text-slate-600 border-slate-300',
  closed: 'bg-slate-100 text-slate-600 border-slate-300',
  inactive: 'bg-slate-100 text-slate-600 border-slate-300',
  resigned: 'bg-slate-100 text-slate-600 border-slate-300',
};

export const statusBadge = (status) => {
  const key = String(status || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
  return STATUS_BADGES[key] || 'bg-slate-100 text-slate-600 border-slate-300';
};

export const severityRank = (severity) => {
  const value = String(severity || '').trim().toLowerCase();
  if (value === 'critical') return 5;
  if (value === 'lost') return 4;
  if (value === 'severe') return 3;
  if (value === 'medium') return 2;
  return 1; // 'low' or unknown → lowest
};
