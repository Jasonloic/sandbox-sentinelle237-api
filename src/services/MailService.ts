import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM, APP_URL, APP_NAME } =
    process.env as { [key: string]: string };

export class MailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: Number(SMTP_PORT),
            secure: Number(SMTP_PORT) === 465,
            auth: { user: SMTP_USER, pass: SMTP_PASS },
        });
    }

    async sendVerificationEmail(to: string, pseudo: string, rawToken: string) {
        const link = `${APP_URL}/api/auth/verify-email?token=${rawToken}`;
        await this.transporter.sendMail({
            from: MAIL_FROM,
            to,
            subject: `${APP_NAME} - Vérification de votre email`,
            html: `
        <p>Bonjour ${pseudo},</p>
        <p>Merci de vous être inscrit sur ${APP_NAME}. Cliquez sur le lien ci-dessous pour vérifier votre email (valide 24h) :</p>
        <p><a href="${link}">${link}</a></p>
      `,
        });
    }
}