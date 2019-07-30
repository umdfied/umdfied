const request = require('request');
const config = require('./config');
const db = require('./db');
const { promisify } = require('util');
const reqAsync = promisify(request);
const path = require('path');
const debug = require('./debug');
const REGEX_RAW_GIST_URL = /^https?:\/\/gist\.githubusercontent\.com\/(.+?\/[0-9a-f]+\/raw\/(?:[0-9a-f]+\/)?.+\..+)$/i;
const CDN_URL = 'https://gitcdn.link/cdn';
const GIT_API_URL = 'https://api.github.com/';
const REGISTRY_URL = 'https://registry.npmjs.org/';
const GEO_IP = 'https://api.ipgeolocation.io/ipgeo';

const pkgApi = async (repo, pkg) => {
  try {
    const res = await reqAsync(`https://umdfied-cdn.herokuapp.com/standalone/${repo}`);

    if (res.statusCode === 200 && res.body) {
      const cdnlink = await createGist(pkg, res.body);
      return cdnlink;
    }
    return false;
  } catch (e) {
    console.error(e.stack || e.message)
    return false;
  }
};
const validatePackage = async (pkg, ver) => {
  try {
    let payload = false;
    const isOrg = /^@/.test(pkg);
    pkg = encodeURIComponent(pkg);
    if (!isOrg) {
      ver = !ver ? 'latest' : ver;
      const res = await reqAsync(`${REGISTRY_URL + pkg}/${ver}`);
      const body = JSON.parse(res.body);
      if (res.statusCode === 200 && body) {
        payload = { name: body.name, version: body.version };
      }
    }else{
      if(ver && !/^v/.test(ver) && ver !== 'latest') {
        ver = `v${ver}`
      }else if (ver && ver === 'latest') {
        ver = ''
      }
      const res = await reqAsync(`${REGISTRY_URL + pkg}/${ver}`);
      const body = JSON.parse(res.body);
      if (res.statusCode === 200 && body) {
        payload = { name: body.name, version: ver ? body.version: body['dist-tags'].latest };
      }
    }
    return payload;
  } catch (e) {
    console.error(e.stack || e.message)
    return false;
  }
};
const createGist = async (pkg, content) => {
  try {
    const data = {
      'description': `Umdfied build of ${pkg}`,
      'public': true,
      'files': {}
    };
    pkg = pkg.replace(/@/,'').replace(/\//,'-')
    const fname = `${pkg}.min.js`;
    data.files[fname] = { content };

    const reqOpts = {
      method: 'POST',
      url: '/gists',
      headers: {
        'Authorization': `token ${config.GIT_TOKEN}`,
        'User-Agent': 'Umdfied-App'
      },
      baseUrl: GIT_API_URL,
      json: true,
      body: data
    };
    const res = await reqAsync(reqOpts);

    const body = res.body;
    debug(body, 'createGist');
    let cdnurl = body.files[fname].raw_url.replace(REGEX_RAW_GIST_URL, `${CDN_URL}/$1`);
    return cdnurl;
  } catch (e) {
    console.log(e);
  }
};
const getCountry = async ip => {
  try {
    const geourl = `${GEO_IP}?apiKey=${process.env.GEO_KEY}&ip=${ip}&fields=geo`
    const res = await reqAsync({ url: geourl, json: true });

    const country = res.body.country_name;
    if (country) {
      return country;
    }
    return 'anonymous';
  } catch (e) {
    return 'anonymous';
  }
};
const normalizeIp = ip => ip.replace(/^::ffff:/i, '');
const updateCdn = function(cdnurl) {
  return cdnurl.replace(/(cdn\.rawgit\.com|gistcdn\.githack\.com|cdn\.staticaly\.com\/gist)/, 'gitcdn.link/cdn')
}
exports.umdfied = async (pkg, ver, ip) => {
  try {
    ip = normalizeIp(ip);
    const usrCountry = await getCountry(ip);
    debug(usrCountry, 'usrCountry');
    await db.saveUsrInfo({ ip, country: usrCountry });
    console.log('Checking DB', 'db');
    const repoInfo = await validatePackage(pkg, ver);
    if (!repoInfo) {
      return false;
    }
    let fromDb = await db.getPkg(repoInfo.name, repoInfo.version);
    if (fromDb && (fromDb.cdn.includes('rawgit.com') || fromDb.cdn.includes('githack.com') || fromDb.cdn.includes('staticaly.com'))) {
      fromDb = await db.updatePkg(repoInfo.name, repoInfo.version, updateCdn(fromDb.cdn));
    }
    if (fromDb) {
      return { gitCdn: fromDb.cdn, semver: fromDb.version };
    }
    const repo = `${encodeURIComponent(repoInfo.name)}@${repoInfo.version}`;
    console.log(repo, 'repo');
    const gitCdn = await pkgApi(repo, pkg);
    console.log(gitCdn, 'gitCdn');
    if (!gitCdn) {
      return false;
    }
    await db.savePkg(repoInfo.name, repoInfo.version, gitCdn);
    return { gitCdn, semver: repoInfo.version };
  } catch (e) {
    console.error(`${e.message}\n${e.stack}`, 'umdfied Error');
    return false;
  }
};
