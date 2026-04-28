-- CreateEnum
CREATE TYPE "PromoType" AS ENUM ('RICH_TEXT', 'EXTERNAL_LINK');

-- AlterTable
ALTER TABLE "Enterprise" ADD COLUMN     "promoContent" TEXT,
ADD COLUMN     "promoType" "PromoType" NOT NULL DEFAULT 'RICH_TEXT',
ADD COLUMN     "promoUrl" TEXT;
