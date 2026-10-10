import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import joblib

# Load dataset
data = pd.read_csv("../datasets/energy_data.csv")
# Features
X = data[
    [
        "Temperature",
        "Humidity",
        "Cloudiness",
        "WindSpeed",

        "Hour"
    ]
]

# Target
y = data["EnergyUsage"]

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# Train model
model = RandomForestRegressor(
    n_estimators=100,
    random_state=42
)

model.fit(X_train, y_train)

# Save model
joblib.dump(
    model,
    "energy_model.pkl"
)

print("✅ Model trained and saved successfully!")