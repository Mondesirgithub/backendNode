const sequelize = require('./db');
const User = require('../models/User');

const syncUserTable = async () => {
    try {
        // Vérifier si la table User existe déjà
        const isUserTableExists = await sequelize.getQueryInterface().showAllTables().then(tableNames => {
            return tableNames.includes('Users'); // Vérifie si le nom de la table existe dans la liste des tables
        });

        if (!isUserTableExists) {
            // Si la table User n'existe pas, créez-la
            await User.sync({ force: true });
            console.log("La table User a été créée !");
        } else {
            console.log("La table User existe déjà.");
        }
    } catch (error) {
        console.error("Erreur lors de la synchronisation de la table User :", error);
    }
};

module.exports = syncUserTable;
