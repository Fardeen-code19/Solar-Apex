import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { runSolarAgent } from './agent.js';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/leads', (req, res) => {
  const { name, phone, city, bill, kw, subsidy } = req.body;
  console.log("📥 NEW LEAD RECEIVED:", { name, phone, city, bill, kw, subsidy });
  res.json({ success: true, message: "Rooftop survey booked successfully!" });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, systemPrompt } = req.body;
    const agentResponse = await runSolarAgent(messages, systemPrompt);
    res.json(agentResponse);
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: "Failed to communicate with AI agent." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 SolarApex Server running at http://localhost:${PORT}`);
});