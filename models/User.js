const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
    // Définition des champs du modèle User
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        unique: {
            msg: 'Ce username est déjà pris.'
        },
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = User;
