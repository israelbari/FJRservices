-- AlterTable
ALTER TABLE "media" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "section_id" TEXT;

-- AlterTable
ALTER TABLE "videos" ADD COLUMN     "playback_rate" DOUBLE PRECISION NOT NULL DEFAULT 1,
ADD COLUMN     "src" TEXT DEFAULT '',
ALTER COLUMN "url" SET DEFAULT '';
