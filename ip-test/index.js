const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT || 8080;

app.get('/', async (req, res) => {
  try {
    const response = await fetch('https://api.ipify.org');
    const ip = await response.text();
    res.send(`Outbound IP: ${ip}`);
  } catch (error) {
    res.send(`Error: ${error.message}`);
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
