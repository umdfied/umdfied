const assert = require('assert');
const {sql, _raw} = require('pg-extra');
const {pool} = require('./connector');
const debug = require('../debug');
exports.getPkg = async (pkg, ver) => {
  debug(pkg, 'getPkg pkg');
  debug(ver, 'getPkg ver');
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
  debug(usr, 'saveUserInfo');
  assert(typeof usr === 'object' && !Array.isArray(usr));
  const ip = usr.ip;
  const country = usr.country;
  return pool.one(sql`
    INSERT INTO users ( ip_address, country )
    VALUES (${ip}::inet,${country})
  `);
};
