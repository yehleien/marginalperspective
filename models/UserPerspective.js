module.exports = (sequelize, DataTypes) => {
    const UserPerspective = sequelize.define('UserPerspective', {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      perspectiveId: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    }, {
      timestamps: false // Assuming you don't need timestamps for this join table
    });
  
    UserPerspective.associate = function(models) {
      UserPerspective.belongsTo(models.Perspective, {
        foreignKey: 'perspectiveId',
        as: 'Perspective' // This alias must match how you refer to it in queries
      });
      // Any other necessary associations
    };
  
    return UserPerspective;
    };