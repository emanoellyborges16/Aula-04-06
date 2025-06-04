const backendBaseUrl = 'http://localhost:3001';

// Tabs
const tabGarage = document.getElementById('tabGarage');
const tabWeather = document.getElementById('tabWeather');
const garageSection = document.getElementById('garageSection');
const weatherSection = document.getElementById('weatherSection');

// Garage elements
const statusSpan = document.getElementById('status');
const abrirBtn = document.getElementById('abrirBtn');
const fecharBtn = document.getElementById('fecharBtn');
const refreshCarStatusBtn = document.getElementById('refreshCarStatus');
const fuelLevelSpan = document.getElementById('fuelLevel');
const lastMaintenanceSpan = document.getElementById('lastMaintenance');
const mileageSpan = document.getElementById('mileage');
const carStatusSpan = document.getElementById('carStatus');
const reviewForm = document.getElementById('reviewForm');
const reviewMessage = document.getElementById('reviewMessage');

// Weather elements
const weatherForm = document.getElementById('weatherForm');
const resultadoDiv = document.getElementById('resultado');

// Tab switching
tabGarage.addEventListener('click', () => {
  tabGarage.classList.add('active');
  tabWeather.classList.remove('active');
  garageSection.style.display = 'block';
  weatherSection.style.display = 'none';
});

tabWeather.addEventListener('click', () => {
  tabWeather.classList.add('active');
  tabGarage.classList.remove('active');
  weatherSection.style.display = 'block';
  garageSection.style.display = 'none';
});

// Garage functions
async function atualizarStatus() {
  try {
    const response = await fetch(`${backendBaseUrl}/garage/status`);
    const data = await response.json();
    statusSpan.textContent = data.doorOpen ? 'Aberta' : 'Fechada';
  } catch (error) {
    console.error('Erro ao obter status da garagem:', error);
  }
}

async function abrirPorta() {
  try {
    const response = await fetch(`${backendBaseUrl}/garage/open`, { method: 'POST' });
    const data = await response.json();
    alert(data.message);
    atualizarStatus();
  } catch (error) {
    console.error('Erro ao abrir a porta:', error);
  }
}

async function fecharPorta() {
  try {
    const response = await fetch(`${backendBaseUrl}/garage/close`, { method: 'POST' });
    const data = await response.json();
    alert(data.message);
    atualizarStatus();
  } catch (error) {
    console.error('Erro ao fechar a porta:', error);
  }
}

async function atualizarStatusCarro() {
  try {
    const response = await fetch(`${backendBaseUrl}/car/status`);
    const data = await response.json();
    fuelLevelSpan.textContent = data.fuelLevel;
    lastMaintenanceSpan.textContent = data.lastMaintenance;
    mileageSpan.textContent = data.mileage;
    carStatusSpan.textContent = data.status;
  } catch (error) {
    console.error('Erro ao obter status do carro:', error);
  }
}

abrirBtn.addEventListener('click', abrirPorta);
fecharBtn.addEventListener('click', fecharPorta);
refreshCarStatusBtn.addEventListener('click', atualizarStatusCarro);

reviewForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const date = document.getElementById('reviewDate').value;
  const notes = document.getElementById('reviewNotes').value;

  if (!date) {
    reviewMessage.textContent = 'Por favor, informe a data da revisão.';
    reviewMessage.style.color = 'red';
    return;
  }

  try {
    const response = await fetch(`${backendBaseUrl}/car/schedule-review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, notes }),
    });
    const data = await response.json();
    if (response.ok) {
      reviewMessage.textContent = data.message;
      reviewMessage.style.color = 'green';
      reviewForm.reset();
    } else {
      reviewMessage.textContent = data.error || 'Erro ao agendar revisão.';
      reviewMessage.style.color = 'red';
    }
  } catch (error) {
    reviewMessage.textContent = 'Erro ao agendar revisão.';
    reviewMessage.style.color = 'red';
    console.error(error);
  }
});

// Weather functions
weatherForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const cidade = document.getElementById('cidade').value.trim();
  if (!cidade) {
    resultadoDiv.textContent = 'Por favor, digite o nome da cidade.';
    return;
  }

  resultadoDiv.textContent = 'Buscando previsão...';

  try {
    const response = await fetch(`${backendBaseUrl}/api/previsao/${encodeURIComponent(cidade)}`);
    if (!response.ok) {
      const errorData = await response.json();
      resultadoDiv.textContent = `Erro: ${errorData.error || 'Não foi possível obter a previsão.'}`;
      return;
    }
    const data = await response.json();
    const texto = `
Cidade: ${data.name}
Temperatura: ${data.main.temp} °C
Descrição: ${data.weather[0].description}
Umidade: ${data.main.humidity}%
Vento: ${data.wind.speed} m/s
    `;
    resultadoDiv.textContent = texto;
  } catch (error) {
    resultadoDiv.textContent = 'Erro ao buscar a previsão do tempo.';
    console.error(error);
  }
});

atualizarStatus();
atualizarStatusCarro();
