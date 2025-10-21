const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(session({
  secret: 'duampompo_secret_key',
  resave: false,
  saveUninitialized: false
}));

const dataPath = path.join(__dirname, 'data', 'db.json');
const authPath = path.join(__dirname, 'data', 'auth.json');

async function init() {
  if (!await fs.pathExists(authPath)) {
    const hashed = await bcrypt.hash('admin123', 10);
    await fs.writeJson(authPath, { username: 'admin', password: hashed });
  }
  if (!await fs.pathExists(dataPath)) {
    await fs.writeJson(dataPath, { students: [], news: [], gallery: [] });
  }
}
init();

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const auth = await fs.readJson(authPath);
  if (username === auth.username && await bcrypt.compare(password, auth.password)) {
    req.session.user = username;
    return res.json({ success: true });
  }
  res.status(401).json({ success: false, message: 'Invalid credentials' });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/check-session', (req, res) => {
  res.json({ loggedIn: !!req.session.user });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
