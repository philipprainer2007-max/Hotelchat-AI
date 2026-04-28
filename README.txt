# HotelChat — Setup in 3 Steps

## What you need
- A free account at render.com (or railway.app)
- A free Anthropic API key from console.anthropic.com

---

## Step 1 — Get your Anthropic API key
1. Go to https://console.anthropic.com
2. Sign up for free
3. Go to "API Keys" → "Create Key"
4. Copy the key (starts with sk-ant-...)

---

## Step 2 — Deploy to Render (free hosting, real URL)
1. Go to https://render.com and sign up free
2. Click "New +" → "Web Service"
3. Choose "Deploy from existing code" → upload this entire folder as a ZIP
   OR connect your GitHub if you know how
4. Settings:
   - Name: hotelchat (or anything you like)
   - Build Command: npm install
   - Start Command: node server.js
5. Add environment variable:
   - Key:   ANTHROPIC_API_KEY
   - Value: (paste your key from Step 1)
6. Click "Create Web Service"
7. Wait ~2 minutes → Render gives you a live URL like:
   https://hotelchat.onrender.com

---

## Step 3 — Use it
- Open your Render URL → you see the admin dashboard
- The chatbots are now fully working
- Click "Get Link" on any hotel to get the shareable link
- Share that link with your hotel client
- They paste the embed code into their website

---

## Adding a new hotel
Just click "+ Add Hotel" in the dashboard, fill in the info, and the chatbot is instantly ready with its own link.

---

## Questions?
The chatbots answer from hotel info first. If they don't know something (nearby restaurants, local transport, weather etc.) they automatically search the web and answer correctly.
