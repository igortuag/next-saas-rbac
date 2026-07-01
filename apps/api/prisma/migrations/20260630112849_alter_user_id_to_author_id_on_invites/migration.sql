/*
  Warnings:

  - You are about to drop the column `owner_id` on the `invites` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "invites" DROP CONSTRAINT "invites_owner_id_fkey";

-- AlterTable
ALTER TABLE "invites" DROP COLUMN "owner_id",
ADD COLUMN     "author_id" TEXT;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
