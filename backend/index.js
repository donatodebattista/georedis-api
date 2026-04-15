const express = require('express');
const cors = require('cors');
const { createClient } = require('redis');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

// keys de lugares para redis
const GROUPS = {
  CERVECERIAS: 'places:cervecerias',
  UNIVERSIDADES: 'places:universidades',
  FARMACIAS: 'places:farmacias',
  EMERGENCIAS: 'places:emergencias',
  SUPERMERCADOS: 'places:supermercados'
};

// Insert lugar
app.post('/api/places', async (req, res) => {
  const { group, name, lat, lng } = req.body;
  if (!group || !name || lat === undefined || lng === undefined) {
    return res.status(400).json({ error: 'Missing required fields (group, name, lat, lng)' });
  }

  // asegura que el grupo sea valido
  const validGroupKey = GROUPS[group.toUpperCase()];
  if (!validGroupKey) {
    return res.status(400).json({ error: 'Invalid interest group' });
  }

  try {
    await redisClient.geoAdd(validGroupKey, {
      longitude: parseFloat(lng),
      latitude: parseFloat(lat),
      member: name
    });
    res.status(201).json({ message: 'Place added safely' });
  } catch (error) {
    console.error('Error adding place:', error);
    res.status(500).json({ error: 'Failed to add place' });
  }
});

// buscar lugares cercanos
app.get('/api/places/nearby', async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'Missing lat or lng parameters.' });
  }

  try {
    const results = {};
    for (const [key, redisKey] of Object.entries(GROUPS)) {
      const places = await redisClient.geoRadiusWith(
        redisKey, 
        { longitude: parseFloat(lng), latitude: parseFloat(lat) },
        5,
        'km',
        ['WITHDIST', 'WITHCOORD']
      );

      results[key] = places.map(p => ({
        name: p.member,
        distance: p.distance,
        coordinates: p.coordinates
      }));
    }

    res.json(results);
  } catch (error) {
    console.error('Error finding places:', error);
    res.status(500).json({ error: 'Failed to find nearby places' });
  }
});

// Calcular distancia
app.get('/api/places/distance', async (req, res) => {

  const { group, name, lat, lng } = req.query;

  if (!group || !name || !lat || !lng) {
    return res.status(400).json({ error: 'Missing parameters (group, name, lat, lng)' });
  }

  const validGroupKey = GROUPS[group.toUpperCase()];
  if (!validGroupKey) {
    return res.status(400).json({ error: 'Invalid group parameter.' });
  }

  try {

    const places = await redisClient.geoRadiusWith(
      validGroupKey, 
      { longitude: parseFloat(lng), latitude: parseFloat(lat) },
      40000, 
      'km',
      ['WITHDIST']
    );

    const place = places.find(p => p.member === name);

    if (place) {
      res.json({ name: place.member, distance: place.distance, unit: 'km' });
    } else {
      res.status(404).json({ error: 'Place not found' });
    }

  } catch (error) {
    console.error('Error calculating distance:', error);
    res.status(500).json({ error: 'Failed to calculate distance' });
  }
});

async function start() {
  await redisClient.connect();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();
