const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host:   process.env.MAIL_HOST,
    port:   Number(process.env.MAIL_PORT) || 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
    family: 4,
    pool:   false,
    connectionTimeout: 10_000,
    greetingTimeout:   10_000,
    socketTimeout:     20_000,
    tls: {
        rejectUnauthorized: false,
    },
    logger: true,
    debug:  true,
});

const VERT_FONCE  = '#0B2B22';
const VERT_ACCENT = '#1B5E4F';
const VERT_CLAIR  = '#16A85C';
const BLANC       = '#FFFFFF';
const GRIS_TEXTE  = '#2C3E50';
const GRIS_FOND   = '#F5F7FA';

function emailLayout({ titre, contenu, boutonLabel, boutonLien, avertissement }) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, Helvetica, Arial, sans-serif; background: ${BLANC}; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 40px auto; background: ${BLANC}; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .header { background: ${VERT_CLAIR}; padding: 36px 32px; }
    .logo-row { display: flex; align-items: center; gap: 8px; }
    .brand { color: ${BLANC}; font-size: 36px; font-weight: 700; letter-spacing: -0.3px; }
    .tagline { color: rgba(255,255,255,0.65); font-size: 12px; margin-top: 4px; }
    .body { padding: 36px 32px; color: ${GRIS_TEXTE}; }
    .body h2 { font-size: 17px; margin: 0 0 12px; color: ${VERT_FONCE}; }
    .body p { font-size: 14.5px; line-height: 1.65; margin: 0 0 16px; color: #4A5568; }
    .btn { display: inline-block; padding: 13px 30px; background: ${VERT_CLAIR};
           color: ${BLANC}; text-decoration: none; border-radius: 8px;
           font-weight: 600; font-size: 14.5px; }
    .btn-wrap { text-align: center; margin: 28px 0; }
    .notice { background: ${GRIS_FOND}; border-left: 3px solid ${VERT_CLAIR};
              padding: 12px 16px; border-radius: 0 6px 6px 0; font-size: 12.5px; color: #5A6B7A; margin-top: 20px; }
    .footer { background: ${GRIS_FOND}; padding: 20px 32px; text-align: center;
              color: #94A3B8; font-size: 11.5px; border-top: 1px solid #EDF1F4; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-row">
        <span class="brand">Sentinelle 237</span>
      </div>
      <div class="tagline">Veille intelligente des flux RSS</div>
    </div>
    <div class="body">
      <h2>${titre}</h2>
      ${contenu}
      <div class="btn-wrap">
        <a href="${boutonLien}" class="btn">${boutonLabel}</a>
      </div>
      <div class="notice">${avertissement}</div>
    </div>
    <div class="footer">
      Sentinelle 237 — IE237 Cameroun<br>
      Cet email a été envoyé automatiquement, ne pas répondre.
    </div>
  </div>
</body>
</html>`;
}

async function envoyerEmailVerification(email, token) {
    const lien = `${process.env.APP_URL}/verifier-email?token=${token}`;

    return transporter.sendMail({
        from:    `"Sentinelle 237" <${process.env.MAIL_USER}>`,
        to:      email,
        subject: 'Vérifiez votre adresse email — Sentinelle 237',
        html: emailLayout({
            titre: 'Bienvenue sur Sentinelle 237',
            contenu: `<p>Merci de vous être inscrit. Pour activer votre compte et accéder à votre veille stratégique, confirmez votre adresse email.</p>`,
            boutonLabel: 'Vérifier mon adresse email',
            boutonLien:  lien,
            avertissement: 'Ce lien expire dans <strong>24 heures</strong>. Si vous n\'avez pas créé de compte, ignorez cet email.',
        }),
    });
}
async function envoyerEmailReinitialisation(email, token) {
    const lien = `${process.env.APP_URL}/reset-password?token=${token}`;

    return transporter.sendMail({
        from:    `"Sentinelle 237" <${process.env.MAIL_USER}>`,
        to:      email,
        subject: 'Réinitialisation de votre mot de passe — Sentinelle 237',
        html: emailLayout({
            titre: 'Réinitialisation du mot de passe',
            contenu: `<p>Une demande de réinitialisation a été effectuée pour votre compte Sentinelle 237.</p>`,
            boutonLabel: 'Réinitialiser mon mot de passe',
            boutonLien:  lien,
            avertissement: 'Ce lien expire dans <strong>1 heure</strong>. Si vous n\'avez pas fait cette demande, ignorez cet email.',
        }),
    });
}

module.exports = { envoyerEmailVerification, envoyerEmailReinitialisation };