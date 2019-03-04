const pgLazy = require('pg-lazy');
const config = require('../config')
const { pool, sql, _raw } = pgLazy(require('pg'), { connectionString: config.DATABASE_URL });

module.exports = { pool, sql, _raw }
