module.exports = (sequelize, DataTypes) => {
  const product = sequelize.define(
    'product',
    {
      public_id: { type: DataTypes.UUID, unique: true, allowNull: false },
      name: { type: DataTypes.STRING },
      description: { type: DataTypes.STRING },
      price: { type: DataTypes.DECIMAL(10, 2) },
      discount: { type: DataTypes.DECIMAL(10, 2) },
      images: { type: DataTypes.JSON },
      bucket_name: { type: DataTypes.STRING },
      category: { type: DataTypes.STRING },
    },
    {
      freezeTableName: true,
      underscored: true,
      timestamps: true,
    },
  );

  return product;
};
