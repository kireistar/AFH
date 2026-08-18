import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.svm import SVR
import time

# --- 0. LOAD DATA ---
df = pd.read_csv(r'C:\Users\starlr\Documents\CAPSTONE\AFH\data_training\behavior_dataset.csv')

FEATURES = [
    'total_borrows', 'total_returns', 'on_time_returns', 'late_returns',
    'damage_count', 'lost_count', 'total_fines', 'unpaid_fines'
]
TARGET = 'risk_score'

X = df[FEATURES]
y = df[TARGET]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print(f"Dataset: {len(df)} rows, {len(FEATURES)} features")
print(f"Train: {len(X_train)}, Test: {len(X_test)}")
print("=" * 70)

# --- 1. DEFINE MODELS + HYPERPARAMETER GRIDS ---

model_configs = {
    'Linear Regression': {
        'pipeline': Pipeline([
            ('scaler', StandardScaler()),
            ('model', LinearRegression())
        ]),
        'param_grid': {},
        'note': 'No hyperparameters to tune'
    },
    'Decision Tree': {
        'pipeline': Pipeline([
            ('model', DecisionTreeRegressor(random_state=42))
        ]),
        'param_grid': {
            'model__max_depth': [3, 5, 10, 15, None],
            'model__min_samples_split': [2, 5, 10],
            'model__min_samples_leaf': [1, 2, 4],
        },
        'note': '45 combinations'
    },
    'Random Forest': {
        'pipeline': Pipeline([
            ('model', RandomForestRegressor(random_state=42, n_jobs=-1))
        ]),
        'param_grid': {
            'model__n_estimators': [50, 100, 200],
            'model__max_depth': [5, 10, 15, None],
            'model__min_samples_split': [2, 5, 10],
            'model__min_samples_leaf': [1, 2, 4],
        },
        'note': '144 combinations'
    },
    'Gradient Boosting': {
        'pipeline': Pipeline([
            ('model', GradientBoostingRegressor(random_state=42))
        ]),
        'param_grid': {
            'model__n_estimators': [50, 100, 200],
            'model__max_depth': [3, 5, 7],
            'model__learning_rate': [0.01, 0.05, 0.1, 0.2],
            'model__min_samples_split': [2, 5, 10],
        },
        'note': '108 combinations'
    },
    'SVR': {
        'pipeline': Pipeline([
            ('scaler', StandardScaler()),
            ('model', SVR())
        ]),
        'param_grid': {
            'model__kernel': ['rbf', 'linear'],
            'model__C': [0.1, 1, 10, 100],
            'model__gamma': ['scale', 'auto'],
            'model__epsilon': [0.01, 0.1, 0.2],
        },
        'note': '48 combinations'
    },
}

# --- 2. TUNING + EVALUATION ---
results = []
best_params_all = {}

for name, config in model_configs.items():
    print(f"\n{'='*70}")
    print(f"MODEL: {name}")
    print(f"Tuning: {config['note']}")
    print(f"{'='*70}")

    start_time = time.time()

    if config['param_grid']:
        grid = GridSearchCV(
            config['pipeline'],
            config['param_grid'],
            cv=5,
            scoring='r2',
            n_jobs=-1,
            verbose=0
        )
        grid.fit(X_train, y_train)
        best_model = grid.best_estimator_
        best_params = grid.best_params_
        best_cv_r2 = grid.best_score_

        print(f"\n  Best Parameters:")
        for key, val in best_params.items():
            clean_key = key.replace('model__', '')
            print(f"    {clean_key}: {val}")
        print(f"  Best CV R2 (during tuning): {best_cv_r2:.4f}")
    else:
        best_model = config['pipeline']
        best_model.fit(X_train, y_train)
        best_params = {}
        print(f"\n  No tuning needed (no hyperparameters)")

    elapsed = time.time() - start_time

    y_pred = best_model.predict(X_test)

    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)

    cv_scores = cross_val_score(best_model, X, y, cv=5, scoring='r2')
    cv_mean = cv_scores.mean()
    cv_std = cv_scores.std()

    results.append({
        'Model': name,
        'MAE': mae,
        'RMSE': rmse,
        'R2': r2,
        'CV_R2_Mean': cv_mean,
        'CV_R2_Std': cv_std,
        'Time (s)': elapsed,
    })

    best_params_all[name] = best_params

    print(f"\n  Test Set Metrics:")
    print(f"    MAE:     {mae:.4f} (avg error {mae:.2f} points)")
    print(f"    RMSE:    {rmse:.4f}")
    print(f"    R2:      {r2:.4f} ({r2*100:.1f}% variance explained)")
    print(f"    CV R2:   {cv_mean:.4f} +/- {cv_std:.4f}")
    print(f"    Time:    {elapsed:.1f}s")

# --- 3. COMPARISON TABLE ---
results_df = pd.DataFrame(results).sort_values('R2', ascending=False)

print(f"\n\n{'='*70}")
print("MODEL COMPARISON RESULTS (sorted by R2, all models tuned via GridSearchCV)")
print("="*70)
print(results_df.to_string(index=False, float_format='%.4f'))

best = results_df.iloc[0]
worst = results_df.iloc[-1]

print(f"\n{'='*70}")
print(f"BEST MODEL:  {best['Model']}")
print(f"  R2:   {best['R2']:.4f} ({best['R2']*100:.1f}% variance explained)")
print(f"  MAE:  {best['MAE']:.4f} (avg error {best['MAE']:.2f} points)")
print(f"  RMSE: {best['RMSE']:.4f}")
print(f"  CV R2: {best['CV_R2_Mean']:.4f} +/- {best['CV_R2_Std']:.4f}")
print(f"\nWORST MODEL: {worst['Model']}")
print(f"  R2:   {worst['R2']:.4f} ({worst['R2']*100:.1f}% variance explained)")
print(f"  MAE:  {worst['MAE']:.4f}")

r2_diff = best['R2'] - worst['R2']
print(f"\nR2 gap (best vs worst): {r2_diff:.4f}")
print("="*70)

# --- 4. VISUALIZATION ---

model_names = results_df['Model'].tolist()
best_name = best['Model']
colors = ['#10B981' if name == best_name else '#64748B' for name in model_names]

fig, axes = plt.subplots(1, 3, figsize=(18, 6))

# 4a. R2 Score
r2_vals = results_df['R2'].tolist()
axes[0].barh(model_names[::-1], r2_vals[::-1], color=colors[::-1], edgecolor='white')
axes[0].set_xlabel('R² Score', fontsize=12)
axes[0].set_title('R² Score (higher = better)', fontsize=13, fontweight='bold')
for i, val in enumerate(r2_vals[::-1]):
    axes[0].text(val + 0.003, i, f'{val:.4f}', va='center', fontsize=10)

# 4b. MAE
mae_sorted = results_df.sort_values('MAE')
mae_names = mae_sorted['Model'].tolist()
mae_vals = mae_sorted['MAE'].tolist()
mae_colors = ['#10B981' if name == best_name else '#64748B' for name in mae_names]
axes[1].barh(mae_names[::-1], mae_vals[::-1], color=mae_colors[::-1], edgecolor='white')
axes[1].set_xlabel('MAE', fontsize=12)
axes[1].set_title('MAE (lower = better)', fontsize=13, fontweight='bold')
for i, val in enumerate(mae_vals[::-1]):
    axes[1].text(val + 0.003, i, f'{val:.4f}', va='center', fontsize=10)

# 4c. CV R2 Mean
cv_vals = results_df['CV_R2_Mean'].tolist()
cv_stds = results_df['CV_R2_Std'].tolist()
axes[2].barh(model_names[::-1], cv_vals[::-1], color=colors[::-1], edgecolor='white',
             xerr=cv_stds[::-1], capsize=4)
axes[2].set_xlabel('CV R² Mean', fontsize=12)
axes[2].set_title('Cross-Validation R² (5-Fold)', fontsize=13, fontweight='bold')
for i, val in enumerate(cv_vals[::-1]):
    axes[2].text(val + 0.008, i, f'{val:.4f}', va='center', fontsize=10)

fig.suptitle('Model Comparison — Risk Score Prediction (All Models Tuned with GridSearchCV)',
             fontsize=14, fontweight='bold', y=1.02)
plt.tight_layout()
plt.savefig('model_comparison.png', dpi=150, bbox_inches='tight')
plt.close()
print("\nSaved: model_comparison.png")