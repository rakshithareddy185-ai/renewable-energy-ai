import { useEffect, useState } from "react";
import axios from "axios";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import "./Dashboard.css";

export default function Dashboard() {

  // --------------------------
  // Default Appliance Ratings
  // --------------------------

  const applianceRatings = {
    "Air Conditioner": 1500,
    "Ceiling Fan": 75,
    "LED Bulb": 9,
    "Tube Light": 20,
    "Television": 100,
    "Laptop": 65,
    "Desktop Computer": 250,
    "Refrigerator": 200,
    "Washing Machine": 500,
    "Microwave Oven": 1200,
    "Electric Iron": 1000,
    "Mixer Grinder": 750,
    "Water Heater": 2000,
    "Air Cooler": 200,
    "Induction Stove": 1800,
    "Electric Kettle": 1500,
    "Water Pump": 750,
    "Mobile Charger": 10
  };

  // --------------------------
  // States
  // --------------------------

  const [city, setCity] = useState("Bangalore");

  const [weather, setWeather] = useState({});

  const [prediction, setPrediction] = useState("");

  const [recommendation, setRecommendation] = useState("");

  const [question, setQuestion] = useState("");

  const [answer, setAnswer] = useState("");

  const [loading, setLoading] = useState(false);

  const [graphData, setGraphData] = useState([]);

  const [alert, setAlert] = useState("");

  const [solar, setSolar] = useState(0);

  const [carbon, setCarbon] = useState(0);

  // --------------------------
  // Appliance Calculator
  // --------------------------

  const [appliance, setAppliance] = useState("Air Conditioner");

  const [rating, setRating] = useState(1500);

  const [count, setCount] = useState(1);

  const [hours, setHours] = useState(8);

  const [applianceResult, setApplianceResult] = useState({
    energy: 0,
    dailyCost: 0,
    monthlyCost: 0,
    carbon: 0,
    recommendation: ""
  });

  // --------------------------
  // Change Appliance
  // --------------------------

  const handleApplianceChange = (e) => {

    const selected = e.target.value;

    setAppliance(selected);

    setRating(applianceRatings[selected]);

  };

  // --------------------------
  // Calculate Energy
  // --------------------------

  const calculateEnergy = () => {

    const energy =

      (rating * count * hours) / 1000;

    const dailyCost =

      energy * 8;

    const monthlyCost =

      dailyCost * 30;

    const carbonEmission =

      energy * 0.82;

    let recommendation =

      "Excellent energy usage.";

    if (energy > 20) {

      recommendation =
        "Very High Consumption. Reduce usage.";

    }

    else if (energy > 10) {

      recommendation =
        "Moderate Consumption. Try Energy Saving Mode.";

    }

    else {

      recommendation =
        "Energy Efficient Usage.";

    }

    setApplianceResult({

      energy: energy.toFixed(2),

      dailyCost: dailyCost.toFixed(2),

      monthlyCost: monthlyCost.toFixed(2),

      carbon: carbonEmission.toFixed(2),

      recommendation

    });

  };

  // --------------------------
  // Fetch Weather
  // --------------------------

  const fetchData = async () => {

    try {

      const weatherRes = await axios.get(
        `http://127.0.0.1:5000/weather?city=${city}`
      );

      setWeather(weatherRes.data);

      const predRes = await axios.get(
        `http://127.0.0.1:5000/predict?city=${city}`
      );

      setPrediction(
        predRes.data.predicted_energy_usage
      );

      const recRes = await axios.get(
        "http://127.0.0.1:5000/recommend"
      );

      setRecommendation(
        recRes.data.recommendation
      );

      const solarRes = await axios.get(
        `http://127.0.0.1:5000/solar?city=${city}`
      );

      setSolar(
        solarRes.data.efficiency
      );

      const carbonRes = await axios.get(
        `http://127.0.0.1:5000/carbon?energy=${predRes.data.predicted_energy_usage}`
      );

      setCarbon(
        carbonRes.data.co2_saved
      );

      if (weatherRes.data.cloudiness > 70) {

        setAlert(
          "⚠ Low solar efficiency due to cloudy weather"
        );

      }

      else {

        setAlert(
          "✅ Solar conditions are good"
        );

      }

      setGraphData((prev) => [

        ...prev,

        {

          time: new Date().toLocaleTimeString(),

          energy: predRes.data.predicted_energy_usage,

          temperature: weatherRes.data.temperature

        }

      ]);

    }

    catch (error) {

      console.log(error);

    }

  };

  useEffect(() => {

    fetchData();

    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);

  }, [city]);

  // --------------------------
  // AI Assistant
  // --------------------------

  const askAI = async () => {

    if (!question.trim()) {

      setAnswer("Please enter a question.");

      return;

    }

    try {

      setLoading(true);

      const res = await axios.post(

        "http://127.0.0.1:5000/chat",

        { question }

      );

      setAnswer(res.data.answer);

      const speech =
        new SpeechSynthesisUtterance(
          res.data.answer
        );

      window.speechSynthesis.speak(speech);

    }

    catch {

      setAnswer("AI Assistant Failed.");

    }

    finally {

      setLoading(false);

    }

  };

  // --------------------------
  // Voice Recognition
  // --------------------------

  const startVoice = () => {

    const recognition =
      new window.webkitSpeechRecognition();

    recognition.lang = "en-US";

    recognition.onresult = (event) => {

      setQuestion(
        event.results[0][0].transcript
      );

    };

    recognition.start();

  };
  return (
      

    <div className="dashboard">

      <div className="header">

        <h1>⚡ Smart Renewable Energy AI</h1>

        <p>Real-Time Energy Optimization System</p>

        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
        >
          <option>Bangalore</option>
          <option>Hyderabad</option>
          <option>Chennai</option>
          <option>Mumbai</option>
          <option>Delhi</option>
        </select>

      </div>

      <div className="alert-box">
        {alert}
      </div>

      <div className="cards">

        <div className="card weather">

          <h2>🌤 Weather</h2>

          <h1>{weather.temperature}°C</h1>

          <p>{weather.weather}</p>

          <p>Humidity : {weather.humidity}%</p>

        </div>

        <div className="card prediction">

          <h2>🤖 Prediction</h2>

          <h1>{prediction} kWh</h1>

        </div>

        <div className="card recommendation">

          <h2>🔋 Recommendation</h2>

          <p>{recommendation}</p>

        </div>

        <div className="card">

          <h2>☀ Solar Efficiency</h2>

          <h1>{solar}%</h1>

        </div>

        <div className="card">

          <h2>🌍 Carbon Saved</h2>

          <h1>{carbon} kg</h1>

        </div>

      </div>

      <div className="graph-container">

        <h2>📊 Energy Analytics</h2>

        <ResponsiveContainer
          width="100%"
          height={350}
        >

          <LineChart data={graphData}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="time" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="energy"
              stroke="#00ff99"
            />

            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#00c6ff"
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

      <div className="graph-container">

        <h2>⚡ Appliance Energy Calculator</h2>

        <label>Select Appliance</label>

        <br />

        <select
          value={appliance}
          onChange={handleApplianceChange}
        >

          {Object.keys(applianceRatings).map((item) => (

            <option
              key={item}
              value={item}
            >
              {item}
            </option>

          ))}

        </select>

        <br /><br />

        <label>Power Rating (Watts)</label>

        <br />

        <input

          type="number"

          value={rating}

          onChange={(e)=>
            setRating(Number(e.target.value))
          }

        />

        <br /><br />

        <label>Number of Appliances</label>

        <br />

        <input

          type="number"

          min="1"

          value={count}

          onChange={(e)=>
            setCount(Number(e.target.value))
          }

        />

        <br /><br />

        <label>Hours Used Per Day</label>

        <br />

        <input

          type="number"

          min="1"

          max="24"

          value={hours}

          onChange={(e)=>
            setHours(Number(e.target.value))
          }

        />

        <br /><br />

        <button
          onClick={calculateEnergy}
        >
          Calculate
        </button>

        <br /><br />

        <h3>
          Energy Used :
          {applianceResult.energy}
          kWh/day
        </h3>

        <h3>
          Daily Cost :
          ₹{applianceResult.dailyCost}
        </h3>

        <h3>
          Monthly Cost :
          ₹{applianceResult.monthlyCost}
        </h3>

        <h3>
          Carbon Emission :
          {applianceResult.carbon}
          kg CO₂
        </h3>

        <h3>
          Recommendation
        </h3>

        <p>
          {applianceResult.recommendation}
        </p>

      </div>
            <div className="chat-section">

        <h2>🤖 AI Assistant</h2>

        <input
          type="text"
          placeholder="Ask AI about renewable energy..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        <div className="button-group">

          <button onClick={askAI}>
            Ask AI
          </button>

          <button onClick={startVoice}>
            🎤 Speak
          </button>

        </div>

        {loading && (
          <p>Thinking...</p>
        )}

        <div className="answer-box">
          {answer}
        </div>

      </div>

    </div>

  );

}
    