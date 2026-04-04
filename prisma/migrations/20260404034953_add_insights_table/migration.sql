-- CreateEnum
CREATE TYPE "InsightSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ComparisonType" AS ENUM ('DAY_OVER_DAY', 'WEEK_OVER_WEEK', 'ROLLING_AVERAGE');

-- CreateEnum
CREATE TYPE "InsightStatus" AS ENUM ('ACTIVE', 'DISMISSED', 'SNOOZED');

-- CreateEnum
CREATE TYPE "MetricRunStatus" AS ENUM ('SUCCESS', 'FAILED', 'NO_ANOMALY');

-- CreateTable
CREATE TABLE "insights" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "insightText" TEXT NOT NULL,
    "severity" "InsightSeverity" NOT NULL,
    "deltaPercent" DOUBLE PRECISION NOT NULL,
    "currentValue" DOUBLE PRECISION NOT NULL,
    "previousValue" DOUBLE PRECISION NOT NULL,
    "comparisonType" "ComparisonType" NOT NULL,
    "status" "InsightStatus" NOT NULL DEFAULT 'ACTIVE',
    "snoozedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monitored_metrics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "queryTemplate" TEXT NOT NULL,
    "comparisonType" "ComparisonType" NOT NULL,
    "thresholdPercent" DOUBLE PRECISION NOT NULL DEFAULT 15.0,
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notifyEmail" BOOLEAN NOT NULL DEFAULT false,
    "lastRunAt" TIMESTAMP(3),
    "lastRunStatus" "MetricRunStatus",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monitored_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "insights_userId_idx" ON "insights"("userId");

-- CreateIndex
CREATE INDEX "insights_connectionId_idx" ON "insights"("connectionId");

-- CreateIndex
CREATE INDEX "insights_status_idx" ON "insights"("status");

-- CreateIndex
CREATE INDEX "insights_createdAt_idx" ON "insights"("createdAt");

-- CreateIndex
CREATE INDEX "monitored_metrics_userId_idx" ON "monitored_metrics"("userId");

-- CreateIndex
CREATE INDEX "monitored_metrics_connectionId_idx" ON "monitored_metrics"("connectionId");

-- CreateIndex
CREATE INDEX "monitored_metrics_isActive_idx" ON "monitored_metrics"("isActive");

-- AddForeignKey
ALTER TABLE "insights" ADD CONSTRAINT "insights_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insights" ADD CONSTRAINT "insights_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitored_metrics" ADD CONSTRAINT "monitored_metrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitored_metrics" ADD CONSTRAINT "monitored_metrics_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
