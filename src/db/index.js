const assert = require('assert');
const pgLazy = require('pg-lazy');
const config = require('../config')
const { pool, sql, _raw } = pgLazy(require('pg'), { connectionString: config.DATABASE_URL }, {
  connectionTimeoutMillis: 3000,
  idleTimeoutMillis: 5000,
  max: 50,
  singleton: true
});
const debug = require('../debug');
pool.on('error', err => {
  console.error(`Error ${err.message}`);
  console.error(err.stack);
});
exports.getPkg = async (pkg, ver) => {
  console.log(pkg, 'getPkg pkg');
  console.log(ver, 'getPkg ver');
  assert(typeof pkg === 'string');
  return pool.one(sql`
    SELECT *
    FROM package
    WHERE lower(name) = lower(${pkg}) AND
    lower(version) = lower(${ver})
  `);
};

exports.savePkg = async (pkg, ver, cdn) => {
  assert(typeof pkg === 'string');
  assert(typeof ver === 'string');
  return pool.one(sql`
    INSERT INTO package ( name, version, cdn)
    VALUES (${pkg}, ${ver}, ${cdn} )
  `);
};

exports.saveUsrInfo = async (usr) => {
  console.log(usr, 'saveUserInfo');
  assert(typeof usr === 'object' && !Array.isArray(usr));
  const ip = usr.ip;
  const country = usr.country;
  return pool.one(sql`
    INSERT INTO users ( ip_address, country )
    VALUES (${ip}::inet,${country})
  `);
};
