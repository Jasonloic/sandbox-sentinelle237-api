-- CreateEnum
CREATE TYPE "Offre" AS ENUM ('community', 'entreprise');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "offre" "Offre" NOT NULL DEFAULT 'community';
