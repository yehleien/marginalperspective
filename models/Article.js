module.exports = (sequelize, DataTypes) => {
  const Article = sequelize.define('Article', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true // Ensure that the URL is valid
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    submitDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW // Set default value to current date/time
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'webpage'
    },
    scope: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'webpage'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
        },
    perspectiveId: {
      type: DataTypes.INTEGER,
      allowNull: false    
    }
  }, {
    timestamps: false, // Disable automatic timestamp fields (createdAt, updatedAt)
  });

  Article.associate = function(models) {
    Article.hasMany(models.Comment, {
      foreignKey: 'articleId',
      as: 'comments',
    });
    // Inside your model definition or a separate association file
Article.belongsTo(models.Perspective, {foreignKey: 'perspectiveId'});
models.Perspective.hasMany(Article, {foreignKey: 'perspectiveId'});
  };

  return Article;
};
