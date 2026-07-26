-- CreateEnum
CREATE TYPE "Role" AS ENUM ('veilleur', 'admin');

-- CreateTable
CREATE TABLE "users" (
    "id_user" TEXT NOT NULL,
    "pseudo" TEXT NOT NULL,
    "mail" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'veilleur',
    "pays" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "activated" BOOLEAN NOT NULL DEFAULT true,
    "token_verification" TEXT,
    "token_expiration" TIMESTAMP(3),
    "totp_secret" TEXT,
    "totp_enabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id_user")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_pseudo_key" ON "users"("pseudo");

-- CreateIndex
CREATE UNIQUE INDEX "users_mail_key" ON "users"("mail");
