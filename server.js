const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const server = http.createServer(app);
app.use(express.json());
app.use(cors());
dotenv.config({ path: './.env'})

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;

app.use('/login/:id', async (req, res) => {
  const { id } = req.params;
  parseInt(id);

  try {
    // Vérifier que l'utilisateur existe et qu'il a un id valide dans la base de données
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', id);

    if (error || !data || data.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = data[0];

    // Génération d'un token (json web token) avec comme payload l'id utilisateur
    const token = jwt.sign({ id: user.id }, secretKey);

    res.json({ token });
  } catch (error) {
    console.error('Error while generating token:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


const supabaseUrl = 'https://amgvwodollakutpfnedz.supabase.co';
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3Z3b2RvbGxha3V0cGZuZWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODk1ODM5MDAsImV4cCI6MjAwNTE1OTkwMH0.uF1HUpJdbf4oWnTI_oFKiR51bj_Y4D1CcrWGHdaLmCM";


const secretKey = process.env.API_KEY;
console.log('secret',secretKey);

// Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

app.get("/", (req, res) => {
  res.send("Saline api - API de génération de token");
});

// Middleware - vérifier la validité du token dans le header 
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    req.userId = decoded.id;
    next();
  });
}


// Endpoint : retrouver un utilisateur avec son token
app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    
    const { data, error } = await supabase
      .from('users')
      .select('id, email, firstname, lastname')
      .eq('id', req.userId);

    if (error || !data || data.length === 0) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    const user = data[0];

    res.json(user);
  } catch (error) {
    console.error('Error while fetching user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 5321;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
