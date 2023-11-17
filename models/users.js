'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.Products, {
        sourceKey: 'id',
        foreignKey: 'userId',
      })
    }
  }
  Users.init({
    password: DataTypes.STRING,
    email: DataTypes.STRING,
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Users',
  });
  return Users;
};