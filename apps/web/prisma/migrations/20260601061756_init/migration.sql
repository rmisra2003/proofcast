-- CreateEnum
CREATE TYPE "WalletKind" AS ENUM ('USER', 'DAO', 'TREASURY', 'NFT_COLLECTION', 'CONTRACT');

-- CreateEnum
CREATE TYPE "SnapshotStatus" AS ENUM ('CAPTURING', 'STORED', 'ANCHORED', 'VERIFIED', 'FAILED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VALID', 'INVALID', 'DEGRADED');

-- CreateEnum
CREATE TYPE "AIReportKind" AS ENUM ('SNAPSHOT', 'TREASURY', 'CHAIN_MEMORY');

-- CreateEnum
CREATE TYPE "ActivityKind" AS ENUM ('SNAPSHOT_CREATED', 'SNAPSHOT_VERIFIED', 'SNAPSHOT_ANCHORED', 'WALRUS_STORED', 'TATUM_SYNCED', 'AI_REPORT_CREATED', 'SHARE_CREATED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "displayName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "kind" "WalletKind" NOT NULL DEFAULT 'USER',
    "label" TEXT,
    "ownerUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Snapshot" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "createdByUserId" TEXT,
    "watchedAddress" TEXT NOT NULL,
    "checkpoint" TEXT,
    "checkpointTimestamp" TIMESTAMP(3),
    "status" "SnapshotStatus" NOT NULL DEFAULT 'CAPTURING',
    "publicSlug" TEXT NOT NULL,
    "canonicalHash" TEXT NOT NULL,
    "previousHash" TEXT,
    "walrusBlobId" TEXT,
    "walrusObjectId" TEXT,
    "walrusProofUrl" TEXT,
    "anchorObjectId" TEXT,
    "anchorTxDigest" TEXT,
    "riskScore" INTEGER,
    "aiSummary" TEXT,
    "riskAnalysis" TEXT,
    "changeSummary" TEXT,
    "humanReport" TEXT,
    "raw" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "snapshotId" TEXT,
    "digest" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3),
    "sender" TEXT,
    "recipients" TEXT[],
    "type" TEXT,
    "amountMist" TEXT,
    "gasUsedMist" TEXT,
    "raw" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NFT" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "snapshotId" TEXT,
    "objectId" TEXT NOT NULL,
    "type" TEXT,
    "name" TEXT,
    "imageUrl" TEXT,
    "raw" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NFT_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIReport" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT,
    "kind" "AIReportKind" NOT NULL,
    "model" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "riskScore" INTEGER,
    "report" TEXT NOT NULL,
    "walrusBlobId" TEXT,
    "outputHash" TEXT NOT NULL,
    "raw" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationRecord" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL,
    "walrusOk" BOOLEAN NOT NULL DEFAULT false,
    "tatumOk" BOOLEAN NOT NULL DEFAULT false,
    "anchorOk" BOOLEAN NOT NULL DEFAULT false,
    "hashOk" BOOLEAN NOT NULL DEFAULT false,
    "details" JSONB NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalrusBlob" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT,
    "blobId" TEXT NOT NULL,
    "objectId" TEXT,
    "purpose" TEXT NOT NULL,
    "proofUrl" TEXT,
    "contentHash" TEXT NOT NULL,
    "byteSize" INTEGER,
    "certifiedEpoch" INTEGER,
    "endEpoch" INTEGER,
    "raw" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalrusBlob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityFeed" (
    "id" TEXT NOT NULL,
    "walletId" TEXT,
    "snapshotId" TEXT,
    "kind" "ActivityKind" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityFeed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditTrail" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "walletId" TEXT,
    "action" TEXT NOT NULL,
    "targetId" TEXT,
    "requestId" TEXT,
    "ipHash" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditTrail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_address_key" ON "Wallet"("address");

-- CreateIndex
CREATE INDEX "Wallet_kind_idx" ON "Wallet"("kind");

-- CreateIndex
CREATE UNIQUE INDEX "Snapshot_publicSlug_key" ON "Snapshot"("publicSlug");

-- CreateIndex
CREATE INDEX "Snapshot_watchedAddress_idx" ON "Snapshot"("watchedAddress");

-- CreateIndex
CREATE INDEX "Snapshot_createdAt_idx" ON "Snapshot"("createdAt");

-- CreateIndex
CREATE INDEX "Snapshot_canonicalHash_idx" ON "Snapshot"("canonicalHash");

-- CreateIndex
CREATE INDEX "Transaction_digest_idx" ON "Transaction"("digest");

-- CreateIndex
CREATE INDEX "Transaction_timestamp_idx" ON "Transaction"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_walletId_digest_key" ON "Transaction"("walletId", "digest");

-- CreateIndex
CREATE INDEX "NFT_type_idx" ON "NFT"("type");

-- CreateIndex
CREATE UNIQUE INDEX "NFT_walletId_objectId_key" ON "NFT"("walletId", "objectId");

-- CreateIndex
CREATE INDEX "WalrusBlob_blobId_idx" ON "WalrusBlob"("blobId");

-- CreateIndex
CREATE INDEX "WalrusBlob_purpose_idx" ON "WalrusBlob"("purpose");

-- CreateIndex
CREATE INDEX "ActivityFeed_createdAt_idx" ON "ActivityFeed"("createdAt");

-- CreateIndex
CREATE INDEX "AuditTrail_action_idx" ON "AuditTrail"("action");

-- CreateIndex
CREATE INDEX "AuditTrail_createdAt_idx" ON "AuditTrail"("createdAt");

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Snapshot" ADD CONSTRAINT "Snapshot_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Snapshot" ADD CONSTRAINT "Snapshot_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "Snapshot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NFT" ADD CONSTRAINT "NFT_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NFT" ADD CONSTRAINT "NFT_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "Snapshot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIReport" ADD CONSTRAINT "AIReport_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "Snapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationRecord" ADD CONSTRAINT "VerificationRecord_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "Snapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalrusBlob" ADD CONSTRAINT "WalrusBlob_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "Snapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityFeed" ADD CONSTRAINT "ActivityFeed_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityFeed" ADD CONSTRAINT "ActivityFeed_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "Snapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditTrail" ADD CONSTRAINT "AuditTrail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditTrail" ADD CONSTRAINT "AuditTrail_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
