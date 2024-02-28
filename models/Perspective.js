module.exports = (sequelize, DataTypes) => {
  const Perspective = sequelize.define('Perspective', {
    perspectiveId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    perspectiveName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('Default', 'Custom','AnotherType'),
        allowNull: false,
        defaultValue: 'Custom'
    },
    options: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true
    }
}, {
    timestamps: true
});

  Perspective.associate = function(models) {
    Perspective.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    },
    );
  Perspective.hasMany(models.Comment, {
    foreignKey: 'perspectiveId',
    as: 'perspective',
  });
  Perspective.associate = function(models) {
    Perspective.hasMany(models.Comment, {
        foreignKey: 'perspectiveId',
        as: 'perspective'
    });
};
};

  return Perspective;
};
