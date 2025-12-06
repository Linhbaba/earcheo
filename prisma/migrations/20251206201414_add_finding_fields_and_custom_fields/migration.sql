-- AlterTable
ALTER TABLE "Finding" ADD COLUMN     "acquisitionMethod" TEXT,
ADD COLUMN     "army" TEXT,
ADD COLUMN     "authenticity" TEXT,
ADD COLUMN     "cancellation" TEXT,
ADD COLUMN     "catalogNumber" TEXT,
ADD COLUMN     "conflict" TEXT,
ADD COLUMN     "denomination" TEXT,
ADD COLUMN     "detectorSignal" TEXT,
ADD COLUMN     "dimensions" TEXT,
ADD COLUMN     "estimatedValue" TEXT,
ADD COLUMN     "findingType" TEXT NOT NULL DEFAULT 'GENERAL',
ADD COLUMN     "grade" TEXT,
ADD COLUMN     "landType" TEXT,
ADD COLUMN     "mint" TEXT,
ADD COLUMN     "mintYear" INTEGER,
ADD COLUMN     "origin" TEXT,
ADD COLUMN     "perforation" TEXT,
ADD COLUMN     "period" TEXT,
ADD COLUMN     "periodFrom" INTEGER,
ADD COLUMN     "periodTo" INTEGER,
ADD COLUMN     "printType" TEXT,
ADD COLUMN     "soilConditions" TEXT,
ADD COLUMN     "stampCatalogNumber" TEXT,
ADD COLUMN     "stampYear" INTEGER,
ADD COLUMN     "storageLocation" TEXT,
ADD COLUMN     "unit" TEXT,
ADD COLUMN     "weight" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "CustomField" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fieldType" TEXT NOT NULL,
    "options" TEXT,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomFieldValue" (
    "id" TEXT NOT NULL,
    "findingId" TEXT NOT NULL,
    "customFieldId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomFieldValue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomField_userId_idx" ON "CustomField"("userId");

-- CreateIndex
CREATE INDEX "CustomField_userId_order_idx" ON "CustomField"("userId", "order");

-- CreateIndex
CREATE INDEX "CustomFieldValue_findingId_idx" ON "CustomFieldValue"("findingId");

-- CreateIndex
CREATE INDEX "CustomFieldValue_customFieldId_idx" ON "CustomFieldValue"("customFieldId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomFieldValue_findingId_customFieldId_key" ON "CustomFieldValue"("findingId", "customFieldId");

-- CreateIndex
CREATE INDEX "Finding_findingType_idx" ON "Finding"("findingType");

-- AddForeignKey
ALTER TABLE "CustomField" ADD CONSTRAINT "CustomField_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomFieldValue" ADD CONSTRAINT "CustomFieldValue_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "Finding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomFieldValue" ADD CONSTRAINT "CustomFieldValue_customFieldId_fkey" FOREIGN KEY ("customFieldId") REFERENCES "CustomField"("id") ON DELETE CASCADE ON UPDATE CASCADE;
