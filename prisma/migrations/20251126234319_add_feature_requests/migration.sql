-- CreateEnum
CREATE TYPE "FeatureStatus" AS ENUM ('NEW', 'PLANNED', 'IN_PROGRESS', 'DONE');

-- CreateTable
CREATE TABLE "FeatureRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "FeatureStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureVote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeatureVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FeatureRequest_userId_idx" ON "FeatureRequest"("userId");

-- CreateIndex
CREATE INDEX "FeatureRequest_status_idx" ON "FeatureRequest"("status");

-- CreateIndex
CREATE INDEX "FeatureRequest_createdAt_idx" ON "FeatureRequest"("createdAt");

-- CreateIndex
CREATE INDEX "FeatureVote_userId_idx" ON "FeatureVote"("userId");

-- CreateIndex
CREATE INDEX "FeatureVote_featureId_idx" ON "FeatureVote"("featureId");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureVote_userId_featureId_key" ON "FeatureVote"("userId", "featureId");

-- AddForeignKey
ALTER TABLE "FeatureRequest" ADD CONSTRAINT "FeatureRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureVote" ADD CONSTRAINT "FeatureVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureVote" ADD CONSTRAINT "FeatureVote_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "FeatureRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
