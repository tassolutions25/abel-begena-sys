/*
  Warnings:

  - You are about to drop the column `monthlyPrice` on the `Course` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "monthlyPrice";

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "pricingPlanId" TEXT;

-- CreateTable
CREATE TABLE "PricingPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "daysPerWeek" INTEGER NOT NULL,

    CONSTRAINT "PricingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoursePrice" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "courseId" TEXT NOT NULL,
    "pricingPlanId" TEXT NOT NULL,

    CONSTRAINT "CoursePrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CoursePrice_courseId_pricingPlanId_key" ON "CoursePrice"("courseId", "pricingPlanId");

-- AddForeignKey
ALTER TABLE "CoursePrice" ADD CONSTRAINT "CoursePrice_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoursePrice" ADD CONSTRAINT "CoursePrice_pricingPlanId_fkey" FOREIGN KEY ("pricingPlanId") REFERENCES "PricingPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_pricingPlanId_fkey" FOREIGN KEY ("pricingPlanId") REFERENCES "PricingPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
