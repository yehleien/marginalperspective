module.exports = (sequelize, DataTypes) => {
  const Perspective = sequelize.define('Perspective', {
    perspectiveId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users', // 'users' refers to the table name
        key: 'id',
      },
    },
    perspectiveName: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  Perspective.associate = function(models) {
    Perspective.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  };

  return Perspective;
};
