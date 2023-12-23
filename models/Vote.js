module.exports = (sequelize, DataTypes) => {
    const Vote = sequelize.define('Vote', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      commentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      is_upvote: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: null,
      },
    }, {
      timestamps: false,
      freezeTableName: true,
      underscored: true,
      modelName: 'vote',
    });
  
    Vote.associate = function(models) {
      Vote.belongsTo(models.User, {
        foreignKey: 'userId',
        onDelete: 'CASCADE'
      });
  
      Vote.belongsTo(models.Comment, {
        foreignKey: 'id',
        onDelete: 'CASCADE'
      });
    };
  
    return Vote;
  };