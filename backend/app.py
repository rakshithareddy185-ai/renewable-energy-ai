from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import joblib
from datetime import datetime

app = Flask(__name__)
CORS(app)

# ---------------- MODEL ----------------
model = joblib.load("energy_model.pkl")

# ---------------- CONFIG ----------------
API_KEY = "789651e04811ed573fa75146ec3e71fe"
DEFAULT_CITY = "Bangalore"

# ---------------- HISTORY ----------------
history = []


# ---------------- WEATHER FUNCTION ----------------
def get_weather(city):

    url = (
        f"https://api.openweathermap.org/data/2.5/weather?"
        f"q={city}&appid={API_KEY}&units=metric"
    )

    response = requests.get(url)

    return response.json()


# ---------------- HOME ----------------
@app.route('/')
def home():

    return jsonify({
        "message":
        "Renewable Energy AI Backend Running"
    })


# ---------------- WEATHER ----------------
@app.route('/weather')
def weather():

    try:

        city = request.args.get(
            "city",
            DEFAULT_CITY
        )

        data = get_weather(city)

        return jsonify({

            "city":
                city,

            "temperature":
                data['main']['temp'],

            "humidity":
                data['main']['humidity'],

            "weather":
                data['weather'][0]['description'],

            "cloudiness":
                data['clouds']['all'],

            "wind_speed":
                data['wind']['speed']
        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        })


# ---------------- PREDICT ----------------
@app.route('/predict')
def predict():

    try:

        city = request.args.get(
            "city",
            DEFAULT_CITY
        )

        data = get_weather(city)

        temperature = data['main']['temp']

        humidity = data['main']['humidity']

        cloudiness = data['clouds']['all']

        wind_speed = data['wind']['speed']

        hour = datetime.now().hour

        prediction = model.predict([
            [
                temperature,
                humidity,
                cloudiness,
                wind_speed,
                hour
            ]
        ])

        energy = round(
            float(prediction[0]),
            2
        )

        history.append({

            "time":
                datetime.now().strftime(
                    "%H:%M:%S"
                ),

            "usage":
                energy
        })

        return jsonify({

            "temperature":
                temperature,

            "humidity":
                humidity,

            "cloudiness":
                cloudiness,

            "wind_speed":
                wind_speed,

            "hour":
                hour,

            "predicted_energy_usage":
                energy
        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        })


# ---------------- HISTORY ----------------
@app.route('/history')
def get_history():

    return jsonify(
        history[-20:]
    )


# ---------------- RECOMMEND ----------------
@app.route('/recommend')
def recommend():

    try:

        city = request.args.get(
            "city",
            DEFAULT_CITY
        )

        data = get_weather(city)

        cloudiness = data['clouds']['all']

        temperature = data['main']['temp']

        if cloudiness < 25:

            recommendation = (
                "☀ Excellent solar conditions. "
                "Use washing machine, EV charging "
                "and other heavy appliances now."
            )

        elif cloudiness < 60:

            recommendation = (
                "🌤 Moderate solar conditions. "
                "Use appliances carefully."
            )

        else:

            recommendation = (
                "☁ Cloudy weather detected. "
                "Avoid heavy appliance usage."
            )

        if temperature > 35:

            recommendation += (
                " 🔥 High temperature alert."
            )

        return jsonify({

            "recommendation":
                recommendation
        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        })


# ---------------- SOLAR ----------------
@app.route('/solar')
def solar():

    try:

        city = request.args.get(
            "city",
            DEFAULT_CITY
        )

        data = get_weather(city)

        cloudiness = data['clouds']['all']

        efficiency = round(
            (100 - cloudiness) * 0.8,
            2
        )

        return jsonify({

            "efficiency":
                efficiency
        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        })


# ---------------- CARBON ----------------
@app.route('/carbon')
def carbon():

    try:

        energy = float(
            request.args.get(
                "energy",
                5
            )
        )

        co2_saved = round(
            energy * 0.82,
            2
        )

        return jsonify({

            "co2_saved":
                co2_saved
        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        })


# ---------------- APPLIANCE ----------------
@app.route('/appliance')
def appliance():

    appliance_name = request.args.get(
        "name",
        "AC"
    )

    appliances = {

        "AC": 1.5,

        "Fan": 0.08,

        "TV": 0.12,

        "Refrigerator": 0.15,

        "Washing Machine": 0.50
    }

    usage = appliances.get(
        appliance_name,
        0.10
    )

    cost = round(
        usage * 8,
        2
    )

    return jsonify({

        "usage":
            usage,

        "cost":
            cost
    })


# ---------------- CHAT ----------------
@app.route('/chat', methods=['POST'])
def chat():

    data = request.json

    question = data.get(
        "question",
        ""
    ).lower()

    if "solar" in question:

        answer = (
            "☀ Solar production depends on "
            "cloud cover and weather."
        )

    elif "ac" in question:

        answer = (
            "❄ Use AC at 24°C for "
            "better efficiency."
        )

    elif "bill" in question:

        answer = (
            "💰 Use appliances during "
            "high solar generation periods."
        )

    elif "battery" in question:

        answer = (
            "🔋 Keep battery charge between "
            "40% and 80%."
        )

    else:

        answer = (
            "🤖 Ask me about weather, solar, "
            "energy saving, AC or electricity bills."
        )

    return jsonify({

        "answer":
            answer
    })


# ---------------- LOGIN ----------------
@app.route('/login', methods=['POST'])
def login():

    data = request.json

    if (
        data.get("username") == "admin"
        and
        data.get("password") == "admin"
    ):

        return jsonify({
            "status":
            "success"
        })

    return jsonify({
        "status":
        "fail"
    })


# ---------------- RUN ----------------
if __name__ == '__main__':

    app.run(
        debug=True
    )