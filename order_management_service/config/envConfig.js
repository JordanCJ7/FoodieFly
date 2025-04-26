require('dotenv').config({ path: './.env' });

const getEnvVariable = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
};

module.exports = {
  PORT: getEnvVariable('PORT'),
  MONGO_URL: getEnvVariable('MONGO_URL'),
  JWT_SECRET: getEnvVariable('JWT_SECRET'),
};