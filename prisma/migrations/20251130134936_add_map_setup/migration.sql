-- CreateTable
CREATE TABLE "MapSetup" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MapSetup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MapSetup_userId_idx" ON "MapSetup"("userId");

-- AddForeignKey
ALTER TABLE "MapSetup" ADD CONSTRAINT "MapSetup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
