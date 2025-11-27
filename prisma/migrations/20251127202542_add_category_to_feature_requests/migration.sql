-- AlterTable
ALTER TABLE "FeatureRequest" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'Ostatní';

-- CreateIndex
CREATE INDEX "FeatureRequest_category_idx" ON "FeatureRequest"("category");
