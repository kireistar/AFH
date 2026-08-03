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

export const severityRank = (severity) => {
  const value = String(severity || '').trim().toLowerCase();
  if (value === 'critical') return 5;
  if (value === 'lost') return 4;
  if (value === 'severe') return 3;
  if (value === 'medium') return 2;
  return 1; // 'low' or unknown → lowest
};
