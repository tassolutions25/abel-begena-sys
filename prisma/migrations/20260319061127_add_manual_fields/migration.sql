-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CHAPA', 'MANUAL');

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "method" "PaymentMethod" NOT NULL DEFAULT 'CHAPA',
ADD COLUMN     "receiptUrl" TEXT;
