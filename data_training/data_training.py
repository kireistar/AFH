import pandas as pd
import numpy as np
import joblib
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split,cross_val_score, GridSearchCV
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# --- 0. LOAD DATA ---
df = pd.read_csv('C:\\Users\\tiara\\Documents\\CAPSTONE\\AFH\\data_training\\behavior_dataset.csv')

FEATURES = [
    'total_borrows', 'total_returns', 'on_time_returns', 'late_returns', 'damage_count', 'lost_count', 'total_fines', 'unpaid_fines'
]
TARGET = 'risk_score'

X = df[FEATURES]
y = df[TARGET]

print("=" * 60)
print("STEP 0: DATA LOADED")
print(f"Rows: {len(df)}, Features: {len(FEATURES)}")
print(f"Risk score range: {y.min()} - {y.max()}")
print()

# --- 1. EDA - EXPLORATORY DATA ANALYSIS --- #

# 1a. Correlation Heatmap #
plt.figure(figsize=(10, 8))
corr = df[FEATURES + [TARGET]].corr()
sns.heatmap(corr, annot=True, fmt='.2f', cmap='coolwarm', center=0, square=True, linewidths=0.5)
plt.title('Correlation Heatmap - Features vs Risk Score', fontsize=14, fontweight='bold')
plt.tight_layout()
plt.savefig('eda_correlation_heatmap.png', dpi=150)
plt.close()
print(" Saved: eda_correlation_heatmap.png")

# 1b. Feature Distribution #
fig, axes = plt.subplots(3, 3, figsize=(14, 10))
all_cols = FEATURES + [TARGET]
for i, col in enumerate(all_cols):
    ax = axes[i // 3][i % 3]
    ax.hist(df[col], bins=30, color='steelblue', edgecolor='white', alpha=0.8)
    ax.set_title(col, fontsize=10, fontweight='bold')
    ax.set_ylabel('Count')
fig.suptitle('Feature Distribution', fontsize=14, fontweight='bold')
plt.tight_layout()
plt.savefig('eda_feature_distribution.png', dpi=150)
plt.close()
print(" Saved: eda_feature_distribution.png")

# 1c. Feature vs Target Scatter #
fig, axes = plt.subplots(2, 4, figsize=(16, 8))
for i, col in enumerate(FEATURES):
    ax = axes[i // 4][i % 4]
    ax.scatter(df[col], df[TARGET], alpha=0.3, s=10, color='steelblue')
    ax.set_xlabel(col, fontsize=9)
    ax.set_ylabel('risk_score', fontsize=9)
    ax.set_title(f'{col} vs risk_score', fontsize=9, fontweight='bold')
fig.suptitle('Feature vs Target Scatter Plots', fontsize=14, fontweight='bold')
plt.tight_layout()
plt.savefig('eda_feature_vs_target.png', dpi=150)
plt.close()
print(" Saved: eda_feature_vs_target.png")

# 1d.Tier Distribution #
tier_counts = df['risk_tier'].value_counts()
colors = {'Low': '#10B981', 'Medium': '#F59E0B', 'High': '#EF4444'}
plt.figure(figsize=(7, 7))
plt.pie(tier_counts, labels=tier_counts.index, autopct='%1.1f%%', colors=[colors[t] for t in tier_counts.index], startangle=90, textprops={'fontsize': 12, 'fontweight': 'bold'})
plt.title('Risk Tier Distribution', fontsize=14, fontweight='bold')
plt.tight_layout()
plt.savefig('eda_tier_distribution.png', dpi=150)
plt.close()
print(" Saved: eda_tier_distribution.png")

### Print top correlations with risk_score ###
risk_corr = corr[TARGET].drop(TARGET).sort_values(ascending=False)
print(f"\n Correlation with risk_score:")
for feat, val in risk_corr.items():
    print(f"    {feat}: {val:.4f}")
print()

# --- 2. DATA SPLITTING --- #

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
print(f" Train set: {len(X_train)} rows")
print(f" Test set:  {len(X_test)} rows")
print()

# --- 3. HYPERPARAMETER TUNING (GridSearchCV) --- #

param_grid = {
    'n_estimators': [50, 100, 200],
    'max_depth': [5, 10, 15, None],
    'min_samples_split': [2, 5, 10],
    'min_samples_leaf': [1, 2, 4],
}

grid_search = GridSearchCV(
    RandomForestRegressor(random_state=42, n_jobs=-1),
    param_grid,
    cv=5,
    scoring='r2',
    n_jobs=-1,
    verbose=0
)
grid_search.fit(X_train, y_train)

best_params = grid_search.best_params_
best_cv_score = grid_search.best_score_

print(f"\n Best Parameters:")
for key, val in best_params.items():
    print(f"    {key}: {val}")
print(f"Best CV R2: {best_cv_score:.4f}")
print()

# --- 4. TRAIN FINAL MODEL (with best params) --- #

model = grid_search.best_estimator_
print(f"    Model: RandomForestRegressor")
print(f"    Parameters: {best_params}")
print()

# --- 5. EVALUATION --- #

y_pred = model.predict(X_test)

mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)

print(f"\n Test Set Metrics:")
print(f"    MAE:    {mae:.4f} (rata rata meleset {mae:.2f} poin)")
print(f"    RMSE:   {rmse:.4f} (sensitif terhadap error besar)")
print(f"    R2: {r2:.4f}    (model menjelaskan {r2*100:.1f}% variasi data)")

### Cross Validation (5-Fold) ###
cv_scores = cross_val_score(model, X, y, cv=5, scoring='r2')
print(f"\n  Cross Validation (5-Fold):")
print(f"    R2/fold:    {[f'{s:.4f}' for s in cv_scores]}")
print(f"    Mean r2:    {cv_scores.mean():.4f} more less {cv_scores.std():.4f}")

### MAE vs RMSE analyses ###
print(f"\n MAE vs RMSE Analyses")
if rmse - mae < 0.1:
    print(f"    RMSE - MAE = {rmse - mae:.4f} (small) -> tidak ada error besar yang signifikan")
else:
    print (f"   RMSE - MAE = {rmse - mae:.4f} (high) -> ada beberapa prediksi yang meleset jauh")

### Feature Importance ###
importances = model.feature_importances_
feat_imp = sorted(zip(FEATURES, importances), key=lambda x: - x[1])

print(f"\n Feature Importance:")
for name, imp in feat_imp:
    bar = '[]' * int(imp * 50)
    print(f"    {name:20s} {imp:.4f} {bar}")
print()

# 5a. Actual vs Predicted Scatter #
plt.figure(figsize=(8, 8))
plt.scatter(y_test, y_pred, alpha=0.5, s=20, color='steelblue', edgecolors='white', linewidth=0.3)
plt.plot([1, 10], [1, 10], 'r--', linewidth=2, label='Perfect prediction')
plt.xlabel('Actual Risk Score', fontsize=12)
plt.ylabel('Predicted Risk Score', fontsize=12)
plt.title(f'Actual vs Predicted (R2 = {r2:.4f})', fontsize=14, fontweight='bold')
plt.legend(fontsize=11)
plt.xlim(0.5, 10.5)
plt.ylim(0.5, 10.5)
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('eval_actual_vs_predicted.png', dpi=150)
plt.close()
print("Saved: eval_actual_vs_predicted.png")

# 5b. Feature Importance Bar Chart #
feat_names = [f[0] for f in feat_imp]
feat_values = [f[1] for f in feat_imp]

plt.figure(figsize=(10, 6))
bars = plt.barh(feat_names[::-1], feat_values[::-1], color='steelblue', edgecolor='white')
plt.xlabel('Importance', fontsize=12)
plt.title('Feature Importance - Random Forest', fontsize=14, fontweight='bold')
for bar, val in zip(bars, feat_values[::-1]):
    plt.text(bar.get_width() + 0.005, bar.get_y() + bar.get_height()/2, f'{val:.4f}', va='center', fontsize=10)
plt.tight_layout()
plt.savefig('eval_feature_importance.png', dpi=150)
plt.close()
print("Saved: eval_feature_importance.png")

# 5c. Residual Plot #
residuals = y_test - y_pred
plt.figure(figsize=(10, 6))
plt.scatter(y_pred, residuals, alpha=0.5, s=20, color='steelblue', edgecolors='white', linewidth=0.3)
plt.axhline(y=0, color='red', linestyle='--', linewidth=2)
plt.xlabel('Predicted Risk Score', fontsize=12)
plt.ylabel('Residual (Actual - Predicted)', fontsize=12)
plt.title('Residual Plot', fontsize=14, fontweight='bold')
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('eval_residual_plot.png', dpi=150)
plt.close()
print("Saved: eval_residual_plot.png")

# 5d. Cross Validation Bar Chart #
plt.figure(figsize=(8, 5))
folds = [f'Fold {i+1}' for i in range(len(cv_scores))]
bar_colors = ['steelblue'] * len(cv_scores)
plt.bar(folds, cv_scores, color=bar_colors, edgecolor='white', width=0.6)
plt.axhline(y=cv_scores.mean(), color='red', linestyle='--', linewidth=2, label=f'Mean R2 = {cv_scores.mean():.4f}')
plt.ylabel('R2 Score', fontsize=12)
plt.title('5-Fold Cross Validation Results', fontsize=14, fontweight='bold')
plt.ylim(min(cv_scores) - 0.05, 1.0)
plt.legend(fontsize=11)
plt.tight_layout()
plt.savefig('eval_cross_validation.png', dpi=150)
plt.close()
print("Saved: eval_cross_validation.png")
print()

# --- 6. EXPORT MODEL --- #

joblib.dump(model, 'random_forest.pkl')
print(f"Model saved: random_forest.pkl")
print()

# --- SUMMARY --- #

print(f"Model:          RandomForestRegressor")
print(f"Best Params:    {best_params}")
print(f"MAE:            {mae:.4f}")
print(f"RMSE:           {rmse:.4f}")
print(f"R2:             {r2:.4f}")
print(f"CV Mean R2:     {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
print(f"Top Feature:    {feat_imp[0][0]} ({feat_imp[0][1]:.4f})")
print()