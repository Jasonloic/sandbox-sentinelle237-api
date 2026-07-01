const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const crypto   = require('crypto');
const AuthModel = require('../models/auth.model');
const { envoyerEmailVerification } = require('./email.service');
const notificationService          = require('./notification.service');

const JWT_SECRET         = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

const ACCESS_EXPIRY  = (process.env.JWT_ACCESS_EXPIRY  && process.env.JWT_ACCESS_EXPIRY.trim())  || '1h';
const REFRESH_EXPIRY = (process.env.JWT_REFRESH_EXPIRY && process.env.JWT_REFRESH_EXPIRY.trim()) || '7d';
const BCRYPT_ROUNDS  = 12;

function generateAccessToken(user) {
  return jwt.sign(
      { id_user: user.id_user, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: ACCESS_EXPIRY }
  );
}

function generateRefreshToken(user) {
  return jwt.sign({ id_user: user.id_user }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY });
}

function refreshExpiresAt() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d;
}

// ─── Inscription ──────────────────────────────────────────────────────────────

async function signup({ email, mot_de_passe, role = 'Veilleur' }) {
  const existing = await AuthModel.findUserByEmail(email);
  if (existing) throw Object.assign(new Error('Email déjà utilisé.'), { statusCode: 409 });

  const VALID_ROLES = ['Admin', 'Veilleur'];
  if (!VALID_ROLES.includes(role))
    throw Object.assign(new Error('Rôle invalide.'), { statusCode: 400 });

  const hash            = await bcrypt.hash(mot_de_passe, BCRYPT_ROUNDS);
  const token           = crypto.randomBytes(32).toString('hex');
  const tokenExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const user = await AuthModel.createUser({
    email,
    mot_de_passe:       hash,
    role,
    token_verification: token,
    token_expiration:   tokenExpiration,
  });

  try {
    await envoyerEmailVerification(email, token);
    console.log(`[AUTH] Email de vérification envoyé à ${email}`);
  } catch (err) {
    console.error('[AUTH] ERREUR envoi email vérification :', err.message);
  }

  // Pas de token d'accès — le compte doit être vérifié avant connexion
  return {
    user:    { id_user: user.id_user, email: user.email, role: user.role },
    message: 'Compte créé. Vérifiez votre email pour activer votre compte.',
  };
}

// ─── Vérification email ───────────────────────────────────────────────────────

async function verifierEmail(token) {
  const user = await AuthModel.findByTokenVerification(token);

  if (!user)
    throw Object.assign(new Error('Token invalide ou expiré.'), { statusCode: 400 });

  if (user.email_verifie)
    return { message: 'Email déjà vérifié. Vous pouvez vous connecter.' };

  if (new Date() > new Date(user.token_expiration))
    throw Object.assign(new Error('Token expiré. Demandez un nouveau lien.'), { statusCode: 400 });

  await AuthModel.activerCompte(user.id_user);
  notificationService.notifyEmailVerifie(user.email);

  return { message: 'Email vérifié avec succès. Vous pouvez maintenant vous connecter.' };
}

async function renvoyerVerification(email) {
  const user = await AuthModel.findUserByEmail(email);
  if (!user) throw Object.assign(new Error('Aucun compte associé à cet email.'), { statusCode: 404 });

  if (user.email_verifie)
    return { message: 'Email déjà vérifié.' };

  const token           = crypto.randomBytes(32).toString('hex');
  const tokenExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await AuthModel.regenererTokenVerification(user.id_user, token, tokenExpiration);
  await envoyerEmailVerification(email, token);

  return { message: 'Email de vérification renvoyé.' };
}


async function login({ email, mot_de_passe }) {
  const user = await AuthModel.findUserByEmail(email);
  if (!user) throw Object.assign(new Error('Email ou mot de passe incorrect.'), { statusCode: 401 });

  if (!user.email_verifie)
    throw Object.assign(new Error('Veuillez vérifier votre email avant de vous connecter.'), { statusCode: 403 });

  const valid = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
  if (!valid) throw Object.assign(new Error('Email ou mot de passe incorrect.'), { statusCode: 401 });

  const accessToken  = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  await AuthModel.saveRefreshToken(user.id_user, refreshToken, refreshExpiresAt());

  const { mot_de_passe: _, token_verification: __, ...safeUser } = user;
  return { user: safeUser, accessToken, refreshToken };
}

async function refresh(refreshToken) {
  if (!refreshToken)
    throw Object.assign(new Error('Refresh token manquant.'), { statusCode: 401 });
  const stored = await AuthModel.findRefreshToken(refreshToken);
  if (!stored || stored.revoked)
    throw Object.assign(new Error('Refresh token invalide ou révoqué.'), { statusCode: 401 });

  if (new Date(stored.expires_at) < new Date())
    throw Object.assign(new Error('Refresh token expiré.'), { statusCode: 401 });

  let payload;
  try {
    payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
  } catch {
    throw Object.assign(new Error('Refresh token invalide.'), { statusCode: 401 });
  }

  const user = await AuthModel.findUserById(payload.id_user);
  if (!user) throw Object.assign(new Error('Utilisateur introuvable.'), { statusCode: 401 });
  await AuthModel.revokeRefreshToken(refreshToken);
  const newAccessToken  = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);
  await AuthModel.saveRefreshToken(user.id_user, newRefreshToken, refreshExpiresAt());

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

async function logout(refreshToken) {
  if (refreshToken) await AuthModel.revokeRefreshToken(refreshToken);
}

async function logoutAll(idUser) {
  await AuthModel.revokeAllUserTokens(idUser);
}

async function getProfile(idUser) {
  const user = await AuthModel.findUserById(idUser);
  if (!user) throw Object.assign(new Error('Utilisateur introuvable.'), { statusCode: 404 });
  return user;
}

async function changePassword(idUser, { ancien_mot_de_passe, nouveau_mot_de_passe }) {
  const user = await AuthModel.findUserByEmail(
      (await AuthModel.findUserById(idUser)).email
  );

  const valid = await bcrypt.compare(ancien_mot_de_passe, user.mot_de_passe);
  if (!valid)
    throw Object.assign(new Error('Ancien mot de passe incorrect.'), { statusCode: 401 });

  const hash = await bcrypt.hash(nouveau_mot_de_passe, BCRYPT_ROUNDS);
  await AuthModel.updatePassword(idUser, hash);
  await AuthModel.revokeAllUserTokens(idUser);
}

module.exports = {
  signup, login, refresh, logout, logoutAll, getProfile, changePassword,
  verifierEmail, renvoyerVerification,
};