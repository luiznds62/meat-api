export const environment = {
  server: {
    port: process.env.SERVER_PORT || 3000,
    env: process.env.ENV || "dev",
  },
  db: { url: process.env.DB_URL || "mongodb://localhost/meat-api" },
  security: {
    saltRounds: process.env.SALT_ROUNDS || 10,
    apiSecret: process.env.API_SECRET || "meat-api-secret",
    enableHTTPS: process.env.ENABLE_HTTPS || false,
    certificate: process.env.CERTI_FILE || "./security/keys/cert.pem",
    key: process.env.CERTI_KEY_FILE || "./security/keys/key.pem",
  },
  log: {
    level: process.env.LOG_LEVEL || "debug",
    name: "meat-api",
  },
};
