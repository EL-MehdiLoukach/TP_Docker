const express = require('express');
const app = express();
require('dotenv').config();
//require("./config/db")();
const FactoryRoutes = require('./Routes/FactoryRoutes')


app.use(express.json()); 



// Initialisation du projet
app.get('/', (req, res) => {
  res.send('Bienvenue sur votre backend Express !');
});

// Utilisation de la factory pour créer le routeur pour les produits
app.use('/api/categories', FactoryRoutes.create('category')); 
app.use('/auth', FactoryRoutes.create('auth')); 


// Écoute du serveur sur le port spécifié
app.listen(process.env.PORT || 3000, () => {
  console.log(`Le serveur est en cours d'exécution sur le port ${process.env.PORT || 3000}`);
});
