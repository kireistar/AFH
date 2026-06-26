import pandas as pd
import numpy as np

np.random.seed(42)
N = 1000

# Generate base features
total_borrows = np.random.randint(0, 51, N)

total_returns = np.array([
    np.random.randint(0, tb + 1) if tb > 0 else 0
    for tb in total_borrows
])

on_time_returns = np.array([
    np.random.randint(0, tr + 1) if tr > 0 else 0
    for tr in total_returns
])

late_returns = total_returns - on_time_returns

damage_count = np.random.randint(0, 11, N)
lost_count = np.random.randint(0, 6, N)

# Financial features (in Rupiah)
base_fine = (late_returns * 50000) + (damage_count * 200000) + (lost_count * 500000)
random_fine = np.random.uniform(0, 300000, N)
total_fines = np.clip(
    base_fine * np.random.uniform(0.3, 1.5, N) + random_fine, 0, None
).astype(int)

unpaid_fines = np.array([
    np.random.randint(0, tf + 1) if tf > 0 else 0
    for tf in total_fines
])

# Calculate risk score (1-10)
def safe_normalize(arr):
    max_val = arr.max()
    if max_val == 0:
        return np.zeros_like(arr, dtype=float)
    return arr / max_val

late_ratio = np.divide(late_returns, total_returns, out=np.zeros(N, dtype=float), where=total_returns > 0)
damage_norm = safe_normalize(damage_count)
lost_norm = safe_normalize(lost_count)
unpaid_norm = safe_normalize(unpaid_fines)
borrow_norm = safe_normalize(total_borrows)

# Weighted combination
raw_score = (
    late_ratio * 0.30 +
    damage_norm * 0.25 +
    lost_norm * 0.20 +
    unpaid_norm * 0.15 +
    borrow_norm * 0.10
)

# Scale ke 1-10 + noise
risk_score = 1 + raw_score * 9
score_noise = np.random.normal(0, 0.3, N)
risk_score = np.clip(risk_score + score_noise, 1.0, 10.0)
risk_score = np.round(risk_score, 2)

# Build DataFrame
df = pd.DataFrame({
    'total_borrows': total_borrows,
    'total_returns': total_returns,
    'on_time_returns': on_time_returns,
    'late_returns': late_returns,
    'damage_count': damage_count,
    'lost_count': lost_count,
    'total_fines': total_fines,
    'unpaid_fines': unpaid_fines,
    'risk_score': risk_score,
})

def get_tier(score):
    if score <= 3:
        return 'Low'
    elif score <= 6:
        return 'Medium'
    else:
        return 'High'
    
df['risk_tier'] = df['risk_score'].apply(get_tier)

# Export
df.to_csv('behavior_dataset.csv', index=False)

print(f"Generated {len(df)} rows -> behavior_dataset.csv")
print(f"\nTier distribution:")
print(df['risk_tier'].value_counts())
print(f"\nRisk score stats:")
print(df['risk_score'].describe())