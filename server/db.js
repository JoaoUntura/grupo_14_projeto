const knex = require('knex')
const dotenv = require('dotenv')
dotenv.config()

const db = knex({
  client: 'mysql2',
  connection: {
    host: '127.0.0.1',
    port: 3306,
    user: 'root', //user ou root
    password: 'E1r2i3k4a5.',
    database: 'sabor'
  },
});

 module.exports = db 