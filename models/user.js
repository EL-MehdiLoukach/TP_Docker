const mongoose = require('mongoose');
const Joi = require('joi'); 

// Définition du schéma de l'utilisateur
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true // Assure que chaque nom d'utilisateur est unique
  },
  email: {
    type: String,
    required: true,
    unique: true // Assure que chaque adresse e-mail est unique
  },
  password: {
    type: String,
    required: true
  },
  verified: {
    type: Boolean,  // Utilisez Boolean au lieu de Joi.boolean
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user', // Par défaut, un nouvel utilisateur est considéré comme un utilisateur standard
    required: true
  }
}, { timestamps: true }); // Ajoute automatiquement les champs createdAt et updatedAt

// Création du modèle User basé sur le schéma
const User = mongoose.model('User', userSchema);

// fonction pour la validation du register
function validateRegisterUser(obj) {
    const schema = Joi.object({
        username: Joi.string().min(3).required(),
        email: Joi.string().trim().min(5).max(100).required().email(),
        password: Joi.string().min(8).required(),
        verified: Joi.boolean().default(false),
        role: Joi.string().valid('user', 'admin', 'moderator').default('user'),
    });
    return schema.validate(obj);
}

// fonction pour la validation du login 
function validateLoginrUser(obj) {
    const schema = Joi.object({
      email: Joi.string().trim().min(5).max(100).required().email(),
      password: Joi.string().min(8).required(),
    })
    return schema.validate(obj)
}

// Export du modèle pour l'utiliser ailleurs dans votre application
module.exports = {User, validateLoginrUser, validateRegisterUser};
