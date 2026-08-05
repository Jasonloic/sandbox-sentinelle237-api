import { db } from "../config/db";
import type { Prisma } from "@prisma/client";

export default class ArticleRepository {
  private readonly db;
  constructor() {
    this.db = db;
  }

  async createMany(data: Prisma.ArticleCreateManyInput[]) {
    return await this.db.article.createMany({ data, skipDuplicates: true });
  }

  async getByFluxId(flux_id: string, params?: { skip?: number; take?: number }) {
    const [articles, total] = await Promise.all([
      this.db.article.findMany({
        where: { flux_id },
        orderBy: { date_publication: "desc" },
        skip: params?.skip,
        take: params?.take,
      }),
      this.db.article.count({ where: { flux_id } }),
    ]);
    return { articles, total };
  }

  async searchByKeywordInFlux(flux_ids: string[], keyword: string) {
  if (flux_ids.length === 0) return [];
  return await this.db.article.findMany({
    where: {
      flux_id: { in: flux_ids },
      OR: [
        { titre: { contains: keyword, mode: "insensitive" } },
        { description: { contains: keyword, mode: "insensitive" } },
      ],
    },
    orderBy: { date_publication: "desc" },
    take: 50,
  });
}
}