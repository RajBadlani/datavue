-- CreateEnum
CREATE TYPE "WidgetType" AS ENUM ('CHART', 'METRIC_CARD', 'DATA_TABLE');

-- CreateEnum
CREATE TYPE "RefreshSchedule" AS ENUM ('MANUAL', 'HOURLY', 'DAILY');

-- CreateTable
CREATE TABLE "dashboard_pages" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "shareToken" TEXT,
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboard_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboard_widgets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "dashboardPageId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sql" TEXT NOT NULL,
    "chartConfig" JSONB NOT NULL,
    "widgetType" "WidgetType" NOT NULL,
    "refreshSchedule" "RefreshSchedule" NOT NULL DEFAULT 'MANUAL',
    "lastRefreshedAt" TIMESTAMP(3),
    "cachedResult" JSONB,
    "cachedRowCount" INTEGER,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboard_widgets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dashboard_pages_shareToken_key" ON "dashboard_pages"("shareToken");

-- CreateIndex
CREATE INDEX "dashboard_pages_userId_idx" ON "dashboard_pages"("userId");

-- CreateIndex
CREATE INDEX "dashboard_pages_shareToken_idx" ON "dashboard_pages"("shareToken");

-- CreateIndex
CREATE INDEX "dashboard_widgets_userId_idx" ON "dashboard_widgets"("userId");

-- CreateIndex
CREATE INDEX "dashboard_widgets_connectionId_idx" ON "dashboard_widgets"("connectionId");

-- CreateIndex
CREATE INDEX "dashboard_widgets_dashboardPageId_idx" ON "dashboard_widgets"("dashboardPageId");

-- AddForeignKey
ALTER TABLE "dashboard_pages" ADD CONSTRAINT "dashboard_pages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dashboard_widgets" ADD CONSTRAINT "dashboard_widgets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dashboard_widgets" ADD CONSTRAINT "dashboard_widgets_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dashboard_widgets" ADD CONSTRAINT "dashboard_widgets_dashboardPageId_fkey" FOREIGN KEY ("dashboardPageId") REFERENCES "dashboard_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
