const {extend, sql, _raw} = require('pg-extra')
const config = require('../config')
const pg = extend(require('pg'))

const pool = new pg.Pool({connectionString: config.DATABASE_URL})

module.exports = {pool}
