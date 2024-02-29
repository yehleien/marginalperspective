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
  // Association with User through UserPerspective
  Perspective.belongsToMany(models.User, {
    through: 'UserPerspective',
    foreignKey: 'perspectiveId',
    otherKey: 'userId'
    });

  // If you want a direct relationship between Perspective and User (not through UserPerspective), uncomment below
  // Perspective.belongsTo(models.User, {
  //   foreignKey: 'userId',
  //   as: 'user',
  // });

  // Association with Comment
  Perspective.hasMany(models.Comment, {
    foreignKey: 'perspectiveId',
    as: 'comments', // Ensure this alias matches how you refer to it in queries
  });
};

return Perspective;
};