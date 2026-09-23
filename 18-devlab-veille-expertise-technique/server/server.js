const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const LOG_FILE = path.join(__dirname, 'readings.jsonl');
const MAX_IN_MEMORY = 500;

let readings = [];

// reload what we have on disk so a restart does not empty the dashboard
if (fs.existsSync(LOG_FILE)) {
  readings = fs.readFileSync(LOG_FILE, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((l) => JSON.parse(l))
    .slice(-MAX_IN_MEMORY);
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/** Store one reading from a device, add the server timestamp. */
app.post('/api/readings', (req, res) => {
  const { device, temp_c, humidity, door_open, distance_cm, rssi, uptime_s } = req.body;
  if (!device || typeof door_open !== 'boolean') {
    return res.status(400).json({ error: 'device and door_open are required' });
  }
  const reading = { device, temp_c, humidity, door_open, distance_cm, rssi, uptime_s, received_at: new Date().toISOString() };
  readings.push(reading);
  if (readings.length > MAX_IN_MEMORY) readings.shift();
  fs.appendFile(LOG_FILE, JSON.stringify(reading) + '\n', () => {});
  res.status(201).json(reading);
});

/** Last 50 readings, newest first. */
app.get('/api/readings', (req, res) => {
  res.json(readings.slice(-50).reverse());
});

app.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`));
