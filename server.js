const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DATA_FILE = path.join(__dirname, 'hotels.json');

const DEFAULT_HOTELS = [
  {id:'grand-horizon',name:'Grand Horizon Hotel',location:'45 Seafront Promenade, Miami Beach, FL 33139',emoji:'🏖️',checkin:'3:00 PM',checkout:'11:00 AM',pools:'2 pools — heated outdoor infinity pool (7am–10pm), indoor pool (6am–11pm)',dining:'Horizon Grill open daily 6:30am–11pm. Rooftop bar Skyline 5pm–1am.',rooms:'210 rooms: Standard, Deluxe, Junior Suite, Executive Suite, Penthouse.',other:'Free Wi-Fi. Valet $35/night. Spa 8am–9pm. 24/7 gym. Pets under 10kg ($50/night). Airport transfer $45.',phone:'+1 (305) 555-0198',email:'concierge@grandhorizon.com',status:'active',chats:284},
  {id:'alpine-lodge',name:'Alpine Lodge & Spa',location:'Sonnenwegstrasse 12, Zermatt, Switzerland',emoji:'🏔️',checkin:'2:00 PM',checkout:'10:00 AM',pools:'Indoor heated pool, hot tub, Finnish sauna, steam room.',dining:'Berghaus Restaurant 7am–10pm. Fondue evenings Thursdays.',rooms:'85 rooms and chalets.',other:'Free ski storage. Ski shuttle hourly. Free Wi-Fi. No pets. Breakfast included.',phone:'+41 27 966 0100',email:'stay@alpinelodge.ch',status:'active',chats:97},
  {id:'palazzo-venezia',name:'Palazzo Venezia',location:'Calle del Carbon 4325, Venice, Italy',emoji:'🛶',checkin:'3:00 PM',checkout:'12:00 PM',pools:'Rooftop terrace with canal views and hot tub.',dining:'Ristorante open breakfast, lunch, dinner.',rooms:'42 rooms overlooking Grand Canal.',other:'Free water taxi from airport. 24/7 concierge. Free Wi-Fi.',phone:'+39 041 520 0100',email:'info@palazzovenezia.it',status:'draft',chats:12}
];

function loadHotels() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch(e) {}
  return DEFAULT_HOTELS;
}

function saveHotels(hotels) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(hotels, null, 2));
  } catch(e) {
    console.error('Error saving:', e.message);
  }
}

app.get('/api/hotels', (req, res) => {
  res.json(loadHotels());
});

app.post('/api/hotels', (req, res) => {
  const hotels = loadHotels();
  const hotel = req.body;
  const existing = hotels.findIndex(h => h.id === hotel.id);
  if (existing >= 0) {
    hotels[existing] = hotel;
  } else {
    hotels.unshift(hotel);
  }
  saveHotels(hotels);
  res.json({ success: true, hotels });
});

app.put('/api/hotels/:id', (req, res) => {
  const hotels = loadHotels();
  const idx = hotels.findIndex(h => h.id === req.params.id);
  if (idx >= 0) {
    hotels[idx] = { ...hotels[idx], ...req.body };
    saveHotels(hotels);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Hotel not found' });
  }
});

app.delete('/api/hotels/:id', (req, res) => {
  const hotels = loadHotels();
  const filtered = hotels.filter(h => h.id !== req.params.id);
  saveHotels(filtered);
  res.json({ success: true });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/chat', async (req, res) => {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' });
  }
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    return res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`HotelChat running on port ${PORT}`));
