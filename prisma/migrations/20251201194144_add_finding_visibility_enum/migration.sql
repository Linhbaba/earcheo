-- CreateEnum
CREATE TYPE "FindingVisibility" AS ENUM ('PRIVATE', 'ANONYMOUS', 'PUBLIC');

-- AlterTable
ALTER TABLE "Finding" ADD COLUMN     "visibility" "FindingVisibility" NOT NULL DEFAULT 'PRIVATE';

-- CreateIndex
CREATE INDEX "Finding_visibility_idx" ON "Finding"("visibility");
