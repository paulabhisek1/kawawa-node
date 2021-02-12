const sequelize = require('../config/dbConfig').sequelize;
var DataTypes = require('sequelize/lib/data-types');
const UsersModel = require('../models/user_played_histories')(sequelize,DataTypes);