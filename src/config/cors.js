const rawOrigins     = process.env.CORS_ORIGINS ?? "";
const allowedOrigins = rawOrigins.split(",").map((o) => o.trim()).filter(Boolean);

// Patterns dynamiques — pas dans le .env
const DYNAMIC_PATTERNS = [
  /^https:\/\/[a-zA-Z0-9-]+\.ngrok-free\.app$/,
  /^https:\/\/[a-zA-Z0-9-]+\.ngrok\.io$/,
  /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/,
  /^http:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/,
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    // Vérification exacte (liste .env)
    if (allowedOrigins.includes(origin)) return callback(null, true);

    // Vérification par pattern (ngrok, LAN)
    if (DYNAMIC_PATTERNS.some((pattern) => pattern.test(origin)))
      return callback(null, true);

    console.warn(`[CORS] Origine bloquée : ${origin}`);
    callback(new Error(`CORS : origine non autorisée — ${origin}`));


    console.log('[CORS] Requête depuis :', origin);

    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
        console.log('[CORS] Autorisé via liste exacte');
        return callback(null, true);
    }
    if (DYNAMIC_PATTERNS.some((pattern) => pattern.test(origin))) {
        console.log('[CORS] Autorisé via pattern dynamique');
        return callback(null, true);
    }

      console.warn('[CORS] BLOQUÉ :', origin);
      callback(new Error(`CORS : origine non autorisée — ${origin}`));
  },
  methods:             ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders:      ["Content-Type", "Authorization", "ngrok-skip-browser-warning", "x-user-id"],
  exposedHeaders:      ["X-Total-Count", "X-Rapport-Id", "X-Nb-Articles"],
  credentials:         true,
  optionsSuccessStatus: 204,
};

console.log('[CORS] Origines chargées :', allowedOrigins);

module.exports = { corsOptions };