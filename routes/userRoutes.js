const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const users = await User.findAll(); // Récupère tous les utilisateurs depuis la base de données

        res.json(users); // Renvoie la liste des utilisateurs au format JSON
    } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs :", error);
        res.status(500).json({ message: `Erreur interne du serveur ${error}` });
    }
});


router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = await User.findOne({ where: { username: username } });

        if (existingUser) {
            // L'utilisateur existe déjà, renvoyer une erreur
            return res.status(400).json({ message: "Cet utilisateur existe déjà" });
        }
        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer un nouvel utilisateur dans la base de données
        await User.create({ username, password: hashedPassword });
        res.status(201).json({ message: "Utilisateur créé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la création de l'utilisateur :", error);
        res.status(500).json({ message: `Erreur interne du serveur ${error}` });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Rechercher l'utilisateur dans la base de données
        const user = await User.findOne({ where: { username } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Nom d'utilisateur et/ou mot de passe incorrect" });
        }
        
        // Générer un token JWT
        const accessToken = jwt.sign({ username: user.username }, 'my_secret_key', { expiresIn: '1h' });

        // Retourner les informations de l'utilisateur connecté avec le token JWT
        res.json({ 
            user: { 
                id: user.id,
                username: user.username,
                createdAt: user.createdAt,
                accessToken : accessToken
            }
        });
    } catch (error) {
        console.error("Erreur lors de la connexion de l'utilisateur :", error);
        res.status(500).json({ message: `Erreur interne du serveur ${error}` });
    }
});


module.exports = router;
