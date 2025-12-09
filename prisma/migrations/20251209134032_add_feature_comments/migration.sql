-- CreateTable
CREATE TABLE "FeatureComment" (
    "id" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeatureComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FeatureComment_featureId_idx" ON "FeatureComment"("featureId");

-- CreateIndex
CREATE INDEX "FeatureComment_userId_idx" ON "FeatureComment"("userId");

-- AddForeignKey
ALTER TABLE "FeatureComment" ADD CONSTRAINT "FeatureComment_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "FeatureRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureComment" ADD CONSTRAINT "FeatureComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
