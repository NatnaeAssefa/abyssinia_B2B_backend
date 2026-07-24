"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Make product_id nullable
    await queryInterface.changeColumn("quote_requests", "product_id", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "products",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    // Add product_name column
    await queryInterface.addColumn("quote_requests", "product_name", {
      type: Sequelize.STRING,
      allowNull: true,
      after: "product_id", // Optional (works only in MySQL)
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove product_name
    await queryInterface.removeColumn("quote_requests", "product_name");

    // Revert product_id to NOT NULL
    await queryInterface.changeColumn("quote_requests", "product_id", {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },
};