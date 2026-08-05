import { db } from "../config/db";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default class ApiQuotaRepository {
  private readonly db;
  constructor() {
    this.db = db;
  }

  async getTodayCount(cle: string): Promise<number> {
    const row = await this.db.apiQuota.findUnique({ where: { cle } });
    if (!row || row.date !== today()) return 0;
    return row.compteur;
  }

  async increment(cle: string, by = 1) {
    const currentDate = today();
    const existing = await this.db.apiQuota.findUnique({ where: { cle } });

    if (!existing || existing.date !== currentDate) {
      await this.db.apiQuota.upsert({
        where: { cle },
        create: { cle, date: currentDate, compteur: by },
        update: { date: currentDate, compteur: by },
      });
    } else {
      await this.db.apiQuota.update({ where: { cle }, data: { compteur: { increment: by } } });
    }
  }
}