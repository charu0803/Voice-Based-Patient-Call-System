require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const OLLAMA_URL = process.env.OLLAMA_URL;
const MODEL = process.env.MODEL;

// Chat endpoint to handle user prompts
app.post('/api/chat', async (req, res) => {
    const { prompt } = req.body;

    // Check if a prompt is provided
    if (!prompt) {
        return res.status(400).send({ error: 'Prompt is required' });
    }

    try {
        // Send request to Ollama API
        const response = await axios.post(OLLAMA_URL, {
            prompt,
            model: MODEL,
        }, {
            headers: { 'Content-Type': 'application/json' },
        });

        // Parse and return the response
        const tokens = response.data.response;
        res.send({ response: tokens });
    } catch (error) {
        console.error('Error communicating with Ollama:', error.message);
        res.status(500).send({ error: 'Failed to process the request' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
