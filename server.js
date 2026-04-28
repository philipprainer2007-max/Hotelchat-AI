const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/chat', async (req, res) => {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  console.log('API Key present:', !!ANTHROPIC_API_KEY);
  
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'No API key' });
  }

  try {
    const fetch = (await import('node-fetch')).default;
    
    const body = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: req.body.system,
      messages: req.body.messages
    };

    console.log('Calling Anthropic API...');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    console.log('Response:', JSON.stringify(data).substring(0, 200));
    return res.json(data);

  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`HotelChat running on port ${PORT}`));
