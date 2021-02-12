const sequelize = require('../config/dbConfig').sequelize;
var DataTypes = require('sequelize/lib/data-types');
const UsersModel = require('../models/artists')(sequelize,DataTypes);