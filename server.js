const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, { 
    cors: {
        origin: "*", 
        methods: ["GET", "POST"],
    } 
});



// 1. Connect to MongoDB (Paste your string here)
mongoose.connect(process.env.DATABASE_URL);


// 2. Define the Schema
const FireLogSchema = new mongoose.Schema({
    department: String,
    smoke: Number,
    temp: Number,
    risk: String,
    score: Number,
    hum:Number,
    smokeRoc: Number,
    tempRoc: Number,
    description: String,
    heap: Number,
    timestamp: { type: Date, default: Date.now }
});
const Log = mongoose.model('FireLog', FireLogSchema);

let esp8266Ip = "";
// 3. Endpoint for ESP8266
app.post('/api/log', async (req, res) => {
    esp8266Ip = req.ip.replace('::ffff:', '');
    try {
        const entry = new Log(req.body);
        await entry.save();
        io.emit('newData', req.body);
        console.log("Logged:", req.body);
        res.status(200).json({ status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/test-alarm', async (req, res) => {
    if (!esp8266Ip) return res.status(400).send("ESP8266 not found yet");
    try {
        const axios = require('axios');
        await axios.post(`http://${esp8266Ip}/api/test-alarm`);
        res.send({ status: "forwarded" });
    } catch (e) { res.status(500).send("Failed to reach ESP"); }
});

// 4. Endpoint for your Website to see History
app.get('/api/history', async (req, res) => {
    const logs = await Log.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
});

app.get('/api/alerts', async (req, res) => {
    // Fetch last 5 logs that were NOT 'SAFE'
    try {
        // We look for any risk that is NOT 'SAFE'
        const alerts = await Log.find({ risk: { $ne: 'SAFE' } })
                                .sort({ timestamp: -1 }) // Newest first
                                .limit(5);               // Only 5 entries
        
        // console.log(`[DB] Found ${alerts.length} recent alerts.`);
        res.json({ alerts: alerts }); 
    } catch (err) {
        console.error("[SERVER] Error fetching alerts:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const axios = require('axios'); // Ensure axios is required at the top

app.post('/api/dispatch', async (req, res) => {
    const { dept, level, trigger } = req.body;
    
    console.log(`🚨 DISPATCH INITIATED: ${dept} | Level: ${level} | Type: ${trigger}`);
    // Construct a professional emergency message
    const message = `🚨 *EMERGENCY DISPATCH REPORT*\n\n` +
                    `📍 *Location:* ${dept}\n` +
                    `⚠️ *Risk Level:* ${level}\n` +
                    `🤖 *Triggered By:* ${trigger}\n\n`

    try {
        // Send to Telegram API
        const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`;
        
        await axios.post(telegramUrl, {
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: "Markdown"
        });

        console.log("✅ Emergency Telegram message sent successfully.");
        res.status(200).send({ status: "Alert dispatched to Telegram" });

    } catch (error) {
        console.error("❌ Telegram Dispatch Error:", error.response ? error.response.data : error.message);
        res.status(500).send({ error: "Failed to send Telegram alert" });
    }
});

server.listen(3000, () => console.log('Server running on port 3000'));