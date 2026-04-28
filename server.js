const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Proxy endpoint — receives chat request from frontend, calls Anthropic
app.post('/api/chat', async (req, res) => {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set in environment' });
  }

  try {
    const fetch = (await import('node-fetch')).default;

    // First API call
    const response1 = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05'
      },
      body: JSON.stringify(req.body)
    });

    const data1 = await response1.json();

    // If model wants to use web search, handle the tool loop
    if (data1.stop_reason === 'tool_use') {
      const toolBlock = data1.content.find(b => b.type === 'tool_use');
      // Find search result blocks in the response (server-side search)
      const searchResultBlocks = data1.content.filter(b => b.type === 'tool_result');

      const messagesWithTool = [
        ...req.body.messages,
        { role: 'assistant', content: data1.content },
        {
          role: 'user',
          content: [{
            type: 'tool_result',
            tool_use_id: toolBlock.id,
            content: searchResultBlocks.length > 0
              ? searchResultBlocks[0].content
              : 'Web search completed.'
          }]
        }
      ];

      const response2 = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'web-search-2025-03-05'
        },
        body: JSON.stringify({
          ...req.body,
          messages: messagesWithTool
        })
      });

      const data2 = await response2.json();
      return res.json(data2);
    }

    return res.json(data1);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`HotelChat running on http://localhost:${PORT}`));
