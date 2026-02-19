-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('SERVICE_REQUEST', 'SERVICE_OFFERING');

-- CreateEnum
CREATE TYPE "PricingType" AS ENUM ('FIXED', 'HOURLY', 'PER_LOCATION');

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "jobType" "JobType" NOT NULL DEFAULT 'SERVICE_REQUEST',
ADD COLUMN     "pricingType" "PricingType" NOT NULL DEFAULT 'FIXED',
ALTER COLUMN "budget" DROP NOT NULL;

-- CreateTable
CREATE TABLE "BookingRequest" (
    "id" TEXT NOT NULL,
    "preferredDate" TIMESTAMP(3) NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "jobId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalFood" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "images" TEXT[],
    "pickupOnly" BOOLEAN NOT NULL DEFAULT false,
    "pickupLocation" TEXT,
    "deliveryAvailable" BOOLEAN NOT NULL DEFAULT false,
    "deliveryArea" TEXT,
    "location" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "vendorId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocalFood_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodOrder" (
    "id" TEXT NOT NULL,
    "foodItemId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "orderType" TEXT NOT NULL,
    "deliveryAddress" TEXT,
    "pickupLocation" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FoodOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookingRequest_jobId_idx" ON "BookingRequest"("jobId");

-- CreateIndex
CREATE INDEX "BookingRequest_clientId_idx" ON "BookingRequest"("clientId");

-- CreateIndex
CREATE INDEX "BookingRequest_status_idx" ON "BookingRequest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "BookingRequest_jobId_clientId_key" ON "BookingRequest"("jobId", "clientId");

-- CreateIndex
CREATE INDEX "LocalFood_category_status_idx" ON "LocalFood"("category", "status");

-- CreateIndex
CREATE INDEX "LocalFood_vendorId_idx" ON "LocalFood"("vendorId");

-- CreateIndex
CREATE INDEX "LocalFood_status_idx" ON "LocalFood"("status");

-- CreateIndex
CREATE INDEX "LocalFood_createdAt_idx" ON "LocalFood"("createdAt");

-- CreateIndex
CREATE INDEX "FoodOrder_foodItemId_idx" ON "FoodOrder"("foodItemId");

-- CreateIndex
CREATE INDEX "FoodOrder_customerId_idx" ON "FoodOrder"("customerId");

-- CreateIndex
CREATE INDEX "FoodOrder_status_idx" ON "FoodOrder"("status");

-- CreateIndex
CREATE INDEX "Job_jobType_status_idx" ON "Job"("jobType", "status");

-- AddForeignKey
ALTER TABLE "BookingRequest" ADD CONSTRAINT "BookingRequest_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingRequest" ADD CONSTRAINT "BookingRequest_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalFood" ADD CONSTRAINT "LocalFood_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodOrder" ADD CONSTRAINT "FoodOrder_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "LocalFood"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodOrder" ADD CONSTRAINT "FoodOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
