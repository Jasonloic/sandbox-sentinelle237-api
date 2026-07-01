const { pool } = require('../config/database');

async function findUserByEmail(email) {
  const { rows } = await pool.query(
    `SELECT id_user, email, mot_de_passe, role, created_at
     FROM utilisateur WHERE email = $1`,
    [email]
  );
  return rows[0] ?? null;
}

async function findUserById(idUser) {
  const { rows } = await pool.query(
    `SELECT id_user, email, role, created_at
     FROM utilisateur WHERE id_user = $1`,
    [idUser]
  );
  return rows[0] ?? null;
}

async function createUser({ email, mot_de_passe, role, token_verification, token_expiration }) {
  const { rows } = await pool.query(
      `INSERT INTO utilisateur
       (email, mot_de_passe, role, token_verification, token_expiration, email_verifie)
       VALUES ($1, $2, $3, $4, $5, FALSE)
         RETURNING id_user, email, role, created_at`,
      [email, mot_de_passe, role, token_verification, token_expiration]
  );
  return rows[0];
}

async function findByTokenVerification(token) {
  const { rows } = await pool.query(
      `SELECT id_user, email, token_expiration, email_verifie
     FROM utilisateur
     WHERE token_verification = $1`,
      [token]
  );
  return rows[0] ?? null;
}

async function activerCompte(idUser) {
  await pool.query(
      `UPDATE utilisateur
     SET email_verifie = TRUE, token_verification = NULL, token_expiration = NULL
     WHERE id_user = $1`,
      [idUser]
  );
}

async function regenererTokenVerification(idUser, token, expiration) {
  await pool.query(
      `UPDATE utilisateur
     SET token_verification = $1, token_expiration = $2
     WHERE id_user = $3`,
      [token, expiration, idUser]
  );
}

async function updatePassword(idUser, newHash) {
  await pool.query(
    'UPDATE utilisateur SET mot_de_passe = $1 WHERE id_user = $2',
    [newHash, idUser]
  );
}

async function saveRefreshToken(idUser, token, expiresAt) {
  await pool.query(
    `INSERT INTO refresh_token (id_user, token, expires_at)
     VALUES ($1, $2, $3)`,
    [idUser, token, expiresAt]
  );
}

async function findRefreshToken(token) {
  const { rows } = await pool.query(
    `SELECT id_user, expires_at, revoked
     FROM refresh_token WHERE token = $1`,
    [token]
  );
  return rows[0] ?? null;
}

async function revokeRefreshToken(token) {
  await pool.query(
    'UPDATE refresh_token SET revoked = true WHERE token = $1',
    [token]
  );
}

async function revokeAllUserTokens(idUser) {
  await pool.query(
    'UPDATE refresh_token SET revoked = true WHERE id_user = $1',
    [idUser]
  );
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  updatePassword,
  saveRefreshToken,
  findRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  findByTokenVerification,
  activerCompte,
  regenererTokenVerification,
};