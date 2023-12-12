//const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true // Validates the email format
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
      // Consider adding validation for password complexity
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
      // Add additional username validations if needed
    }
    // Add other attributes based on your schema
  }, {
    // Disable timestamps if not needed
    timestamps: true, // Set to false to disable `createdAt` and `updatedAt`
    // Other model options
  });

  User.associate = function(models) {
    User.hasMany(models.Comment, {
      foreignKey: 'userId',
      as: 'comments',
    });
    User.hasMany(models.Perspective, {
      foreignKey: 'userId',
      as: 'perspectives',
    });
  };

  // Define associations here (if any)

  // Define hooks here (if any)
  // Example: Hashing a password before storing it

  return User;
};
