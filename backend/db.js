const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  user: 'node',
  database: 'postgres',
});


pool.connect();


module.exports = {
  query: (q) => {
    return pool.query(q)
  },
}