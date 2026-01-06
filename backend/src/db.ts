import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'doomed',
  database: 'fran_tattoo'
});

export default pool;
