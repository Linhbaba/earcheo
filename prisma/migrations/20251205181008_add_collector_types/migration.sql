-- CreateEnum
CREATE TYPE "TrackStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "CollectorType" AS ENUM ('NUMISMATIST', 'PHILATELIST', 'MILITARIA', 'DETECTORIST');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EquipmentType" ADD VALUE 'MAGNIFIER';
ALTER TYPE "EquipmentType" ADD VALUE 'CATALOG';
ALTER TYPE "EquipmentType" ADD VALUE 'STORAGE';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "collectorTypes" "CollectorType"[] DEFAULT ARRAY[]::"CollectorType"[],
ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Sector" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "geometry" JSONB NOT NULL,
    "stripWidth" DOUBLE PRECISION NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Track" (
    "id" TEXT NOT NULL,
    "sectorId" TEXT NOT NULL,
    "geometry" JSONB NOT NULL,
    "status" "TrackStatus" NOT NULL DEFAULT 'PENDING',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Sector_userId_idx" ON "Sector"("userId");

-- CreateIndex
CREATE INDEX "Sector_createdAt_idx" ON "Sector"("createdAt");

-- CreateIndex
CREATE INDEX "Track_sectorId_idx" ON "Track"("sectorId");

-- CreateIndex
CREATE INDEX "Track_sectorId_order_idx" ON "Track"("sectorId", "order");

-- AddForeignKey
ALTER TABLE "Sector" ADD CONSTRAINT "Sector_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "Sector"("id") ON DELETE CASCADE ON UPDATE CASCADE;
