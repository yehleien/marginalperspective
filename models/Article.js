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
    }
  }, {
    timestamps: false, // Disable automatic timestamp fields (createdAt, updatedAt)
  });

  Article.associate = function(models) {
    Article.hasMany(models.Comment, {
      foreignKey: 'articleId',
      as: 'comments',
    });
  };

  return Article;
};
