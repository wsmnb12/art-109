const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', project: 'The Surveillance Mirror' });
});

app.listen(PORT, () => {
  console.log(`The Surveillance Mirror is running at http://localhost:${PORT}`);
});
