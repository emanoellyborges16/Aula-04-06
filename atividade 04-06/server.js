const express = require('express');
const axios = require('axios');
const cors = require('cors');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

app.use(cors());
app.use(express.json());

let garageDoorOpen = false;
const scheduledReviews = [];

app.get('/garage/status', (req, res) => {
  res.json({ doorOpen: garageDoorOpen });
});

app.post('/garage/open', (req, res) => {
  console.log('Received request to open garage door');
  garageDoorOpen = true;
  res.json({ message: 'Garage door opened', doorOpen: garageDoorOpen });
});

app.post('/garage/close', (req, res) => {
  console.log('Received request to close garage door');
  garageDoorOpen = false;
  res.json({ message: 'Garage door closed', doorOpen: garageDoorOpen });
});

app.get('/car/status', (req, res) => {
  res.json({
    fuelLevel: '75%',
    lastMaintenance: '2024-05-15',
    mileage: '12000 km',
    status: 'OK'
  });
});

app.post('/car/schedule-review', (req, res) => {
  const { date, notes } = req.body;
  if (!date) {
    return res.status(400).json({ error: 'Data da revisão é obrigatória.' });
  }
  const review = { id: scheduledReviews.length + 1, date, notes: notes || '' };
  scheduledReviews.push(review);
  res.json({ message: 'Revisão agendada com sucesso.', review });
});

app.get('/api/previsao/:cidade', async (req, res) => {
  const cidade = req.params.cidade;
  if (!cidade) {
    return res.status(400).json({ error: 'Nome da cidade é obrigatório.' });
  }

  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cidade)}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br`
    );
    res.json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      res.status(404).json({ error: 'Cidade não encontrada.' });
    } else {
      res.status(500).json({ error: 'Erro ao buscar a previsão do tempo.' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Servidor backend rodando em http://localhost:${PORT}`);
});
