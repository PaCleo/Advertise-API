const Sequelize = require('sequelize');
const sequelize = new Sequelize('advertise', 'pacleo', 'ufsm160801', {
    dialect: 'mysql',
    host: 'advertise1.c52zjqcj3gqn.sa-east-1.rds.amazonaws.com',
    port: 3316,
});
sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
}).catch((error) => {
    console.error('Unable to connect to the database: ', error);
});
module.exports = sequelize;