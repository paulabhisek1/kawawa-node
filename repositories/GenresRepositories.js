const sequelize = require('../config/dbConfig').sequelize;
var DataTypes = require('sequelize/lib/data-types');
const UsersModel = require('../models/genres')(sequelize,DataTypes);