# 🛡️ FireGuard Backend (Node.js)

The central command and control server for the **Smart Fire & Smoke Detection System**. This backend acts as the bridge between the ESP8266 hardware and the live Web Dashboard.

## 🌟 Features
* **Persistent Storage:** Logs sensor data (Smoke, Temp, Humidity, Risk Score) to MongoDB Atlas.
* **Real-Time Streaming:** Uses **Socket.io** to push instant updates to the frontend gauges and charts.
* **Emergency Dispatch:** Automated logic to send emergency alerts to a Telegram Bot if risk levels reach "Danger" or "Critical."
* **Command Forwarding:** Forwards "Test Alarm" and "Silence" commands from the Web Dashboard back to the specific ESP8266 IP address.
* **Decision Logic:** Handles the "Dead Man's Switch" protocol for emergency notifications.

## 🛠️ Tech Stack
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (via Mongoose)
* **Real-Time:** Socket.io
* **HTTP Client:** Axios (for Telegram and ESP API calls)

## 📋 Prerequisites
* Node.js (v14 or higher)
* MongoDB Atlas Account
* Telegram Bot Token (via @BotFather)

## 🚀 Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/HarshM1010/Smart-Fire-Detector-ESP8266-backend
   cd Smart-Fire-Detector-ESP8266-backend
