const { Router }        = require('express');
const ctrl              = require('../controllers/auth.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const notificationService = require('../services/notification.service');

const router = Router();

// POST /api/auth/signup   { email, mot_de_passe, role? }
router.post('/signup', ctrl.signup);

// POST /api/auth/login    { email, mot_de_passe }
router.post('/login', ctrl.login);

// POST /api/auth/refresh  (cookie ou body: { refresh_token })
router.post('/refresh', ctrl.refresh);

// POST /api/auth/logout   (cookie ou body: { refresh_token })
router.post('/logout', ctrl.logout);

// POST /api/auth/logout-all  — révoque toutes les sessions
router.post('/logout-all', authMiddleware, ctrl.logoutAll);

// GET  /api/auth/me
router.get('/me', authMiddleware, ctrl.getProfile);

// PATCH /api/auth/password  { ancien_mot_de_passe, nouveau_mot_de_passe }
router.patch('/password', authMiddleware, ctrl.changePassword);

// GET /api/auth/verify-email?token=xxx
router.get('/verify-email', ctrl.verifyEmail);

// POST /api/auth/resend-verification  { email }
router.post('/resend-verification', ctrl.resendVerification);

// GET /api/auth/verify-email/stream?email=xxx — SSE public, pas de JWT
router.get('/verify-email/stream', (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, error: 'Email requis.' });

    res.setHeader('Content-Type',      'text/event-stream');
    res.setHeader('Cache-Control',     'no-cache');
    res.setHeader('Connection',        'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    res.write(`event: connected\ndata: ${JSON.stringify({ message: 'En attente de vérification.' })}\n\n`);

    notificationService.subscribeVerification(email, res);

    const ping = setInterval(() => res.write(': ping\n\n'), 30_000);

    req.on('close', () => {
        clearInterval(ping);
        notificationService.unsubscribeVerification(email, res);
    });
});

module.exports = router;