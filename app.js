const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const sequelize = require('./config/db');
const syncUserTable = require('./config/dbSync');

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());
app.use('/users', userRoutes);

sequelize.sync({ force: false }).then(async () => {
    console.log("La connexion à la base de données est établie !");
    await syncUserTable();
    app.listen(port, () => {
        console.log(`Le serveur sur http://localhost:${port}`);
    });
}).catch(err => {
    console.error("Erreur de connexion à la base de données :", err);
});
