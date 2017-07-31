require('dotenv').config();
const path = require('path');
const { _raw } = require('pg-extra');
const {pool} = require('../src/db/connector');
const fs = require('fs');
const {promisify} = require('util');
const readFileAsync = promisify(fs.readFile);

async function resetSql(filePath) {
  const absolutePath = path.resolve(__dirname, './schema.sql');
  const sqltxt = await readFileAsync(absolutePath, {encoding: 'utf8'});

  await pool.query(_raw`${sqltxt}`);
}

resetSql().then(() => {
  console.log('Finished resetting db');
  process.exit(0);
}, err => {
  console.error('Error:', err, err.stack);
  process.exit(1);
});
