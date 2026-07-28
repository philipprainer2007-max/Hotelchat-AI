const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const MONGODB_URI = process.env.MONGODB_URI;
const DEFAULT_HOTELS = [
  {id:'grand-horizon',name:'Grand Horizon Hotel',location:'45 Seafront Promenade, Miami Beach, FL 33139',emoji:'🏖️',checkin:'3:00 PM',checkout:'11:00 AM',pools:'2 pools — heated outdoor infinity pool (7am–10pm), indoor pool (6am–11pm)',dining:'Horizon Grill open daily 6:30am–11pm. Rooftop bar Skyline 5pm–1am.',rooms:'210 rooms: Standard, Deluxe, Junior Suite, Executive Suite, Penthouse.',other:'Free Wi-Fi. Valet $35/night. Spa 8am–9pm. 24/7 gym. Pets under 10kg ($50/night). Airport transfer $45.',phone:'+1 (305) 555-0198',email:'concierge@grandhorizon.com',status:'active',chats:284,color:'#1a1a2e'},
  {id:'alpine-lodge',name:'Alpine Lodge & Spa',location:'Sonnenwegstrasse 12, Zermatt, Switzerland',emoji:'🏔️',checkin:'2:00 PM',checkout:'10:00 AM',pools:'Indoor heated pool, hot tub, Finnish sauna, steam room.',dining:'Berghaus Restaurant 7am–10pm. Fondue evenings Thursdays.',rooms:'85 rooms and chalets.',other:'Free ski storage. Ski shuttle hourly. Free Wi-Fi. No pets. Breakfast included.',phone:'+41 27 966 0100',email:'stay@alpinelodge.ch',status:'active',chats:97,color:'#1a1a2e'},
  {id:'palazzo-venezia',name:'Palazzo Venezia',location:'Calle del Carbon 4325, Venice, Italy',emoji:'🛶',checkin:'3:00 PM',checkout:'12:00 PM',pools:'Rooftop terrace with canal views and hot tub.',dining:'Ristorante open breakfast, lunch, dinner.',rooms:'42 rooms overlooking Grand Canal.',other:'Free water taxi from airport. 24/7 concierge. Free Wi-Fi.',phone:'+39 041 520 0100',email:'info@palazzovenezia.it',status:'draft',chats:12,color:'#1a1a2e'}
];

let db;

async function getDB() {
  if (db) return db;
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db('hotelchat');
  // Seed default hotels if empty
  const count = await db.collection('hotels').countDocuments();
  if (count === 0) {
    await db.collection('hotels').insertMany(DEFAULT_HOTELS);
    console.log('Default hotels seeded');
  }
  console.log('MongoDB connected');
  return db;
}

app.get('/api/hotels', async (req, res) => {
  try {
    const db = await getDB();
    const hotels = await db.collection('hotels').find({}, {projection:{_id:0}}).toArray();
    res.json(hotels);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/hotels', async (req, res) => {
  try {
    const db = await getDB();
    const hotel = req.body;
    await db.collection('hotels').replaceOne({id: hotel.id}, hotel, {upsert: true});
    const hotels = await db.collection('hotels').find({}, {projection:{_id:0}}).toArray();
    res.json({ success: true, hotels });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/hotels/:id', async (req, res) => {
  try {
    const db = await getDB();
    await db.collection('hotels').updateOne({id: req.params.id}, {$set: req.body});
    res.json({ success: true });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/hotels/:id', async (req, res) => {
  try {
    const db = await getDB();
    await db.collection('hotels').deleteOne({id: req.params.id});
    res.json({ success: true });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/chat', async (req, res) => {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) return res.status(500).json({ error: 'No API key' });
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
