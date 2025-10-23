const knex = require('knex')
const dotenv = require('dotenv')
dotenv.config()

const db = knex({
  client: 'mysql2',
  connection: {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'unifeob@123',
    database: 'loja',
  },
});

 module.exports = db 