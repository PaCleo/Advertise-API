const Sequelize = require('sequelize');
const sequelize = require('../database/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
        select: false
    }
});

const Product = sequelize.define('product', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    price: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    state: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    category: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    pic: {
        type: Sequelize.BLOB,
        allowNull: true,
    }
});

User.hasMany(Product);
Product.belongsTo(User);

User.beforeCreate((user) => {
    return bcrypt.hash(user.password, 10)
        .then(hash => {
            user.password = hash;
        });
});

User.sync();
Product.sync();

module.exports = {
    User,
    Product
};
