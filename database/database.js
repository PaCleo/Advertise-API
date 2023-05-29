const Sequelize = require('sequelize');
const sequelize = new Sequelize('advertise', 'root', 'ufsm160801', {
    dialect: 'mysql',
    host: 'localhost',
    port: 3306,
});
sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
}).catch((error) => {
    console.error('Unable to connect to the database: ', error);
});
module.exports = sequelize;