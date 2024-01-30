const { Sequelize, DataTypes } = require('sequelize');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

const sequelize = new Sequelize(process.env.MYSQL_DB, process.env.MYSQL_USER, process.env.MYSQL_PASS, {
    host: process.env.MYSQL_HOST,
    dialect: 'mysql',
    logging: false // Pour désactiver les logs SQL dans la console
});


const User = sequelize.define('User', {
    // Définition des champs du modèle User
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        unique : {
            msg : 'Ce username est déjà pris.'
        },
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
});


const initializeUserTable = async () => {
    try {
        // Utilise `sequelize.query()` pour exécuter une requête SQL brute
        const [results, metadata] = await sequelize.query("SHOW TABLES LIKE 'User'");

        // Si la table User n'existe pas, créez-la
        if (results.length === 0) {
            await User.sync({ force: true });
            console.log("La table User a été créée !");
        } else {
            console.log("La table User existe déjà.");
        }
    } catch (error) {
        console.error("Erreur lors de l'initialisation de la table User :", error);
    }
};

// Appel de la fonction pour initialiser la table User au démarrage de l'application
initializeUserTable();

// Route pour la page d'accueil
app.get('/', (req, res) => {
    res.send('Bienvenue sur la page d\'accueil !');
});

app.get('/users', async (req, res) => {
    try {
        const users = await User.findAll(); // Récupère tous les utilisateurs depuis la base de données

        res.json(users); // Renvoie la liste des utilisateurs au format JSON
    } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs :", error);
        res.status(500).json({ message: `Erreur interne du serveur ${error}` });
    }
});


app.post('/register', async (req, res) => {
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

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Rechercher l'utilisateur dans la base de données
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(401).json({ message: "Nom d'utilisateur et/ou mot de passe incorrect" });
        }

        // Vérifier le mot de passe
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
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
                // Ajoutez d'autres champs d'informations de l'utilisateur si nécessaire
            }
        });
    } catch (error) {
        console.error("Erreur lors de la connexion de l'utilisateur :", error);
        res.status(500).json({ message: `Erreur interne du serveur ${error}` });
    }
});


// Démarrer le serveur
app.listen(port, () => {
    console.log(`Le serveur sur http://localhost:${port}`);
});
