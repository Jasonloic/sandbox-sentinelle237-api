import UserService from "./UserService";
import { TotpService } from "./TotpService";
import { HttpException } from "../utils/HttpExceptions";

const userService = new UserService();
const totpService = new TotpService();

export default class TotpAuthService {
    private readonly userService: UserService;
    private readonly totpService: TotpService;

    constructor() {
        this.userService = userService;
        this.totpService = totpService;
    }

    async startEnable(id_user: string) {
        const user = await this.userService.getById(id_user);
        if (user.totp_enabled) throw new HttpException(400, "TOTP déjà activé");

        const secret = this.totpService.generateSecret();
        const otpauthUrl = this.totpService.generateUri(user.mail, secret);
        const qrCode = await this.totpService.generateQrCode(otpauthUrl);

        await this.userService.updateRaw(id_user, { totp_secret: secret });

        return { qrCode, otpauthUrl };
    }

    async confirmEnable(id_user: string, code: string) {
        const user = await this.userService.getById(id_user);
        if (!user.totp_secret) throw new HttpException(400, "Aucune procédure d'activation en cours");
        const isValid = await this.totpService.verify(code, user.totp_secret);
        if (!isValid) throw new HttpException(400, "Code invalide");
        await this.userService.updateRaw(id_user, { totp_enabled: true });
    }

    async disable(id_user: string, code: string) {
        const user = await this.userService.getById(id_user);
        if (!user.totp_enabled || !user.totp_secret) throw new HttpException(400, "TOTP non activé");
        const isValid = await this.totpService.verify(code, user.totp_secret);
        if (!isValid) throw new HttpException(400, "Code invalide");
        await this.userService.updateRaw(id_user, { totp_enabled: false, totp_secret: null });
    }
}