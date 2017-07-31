
exports.NODE_ENV = process.env.NODE_ENV || 'development';
exports.DEBUG = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
exports.PORT = Number.parseInt(process.env.PORT, 10) || 3000;
exports.TRUST_PROXY = process.env.TRUST_PROXY === 'true';
exports.DATABASE_URL = process.env.DATABASE_URL || 'postgres://127.0.0.1:5432/umdfied';
exports.GIT_TOKEN = process.env.GIT_TOKEN || '';
