/*
  Warnings:

  - You are about to drop the `_GroupsToUsers` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `title` to the `groups` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_GroupsToUsers" DROP CONSTRAINT "_GroupsToUsers_A_fkey";

-- DropForeignKey
ALTER TABLE "_GroupsToUsers" DROP CONSTRAINT "_GroupsToUsers_B_fkey";

-- DropForeignKey
ALTER TABLE "boards" DROP CONSTRAINT "boards_groupId_fkey";

-- AlterTable
ALTER TABLE "groups" ADD COLUMN     "title" TEXT NOT NULL,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- DropTable
DROP TABLE "_GroupsToUsers";

-- CreateTable
CREATE TABLE "_GroupMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GroupMembers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_GroupMembers_B_index" ON "_GroupMembers"("B");

-- AddForeignKey
ALTER TABLE "boards" ADD CONSTRAINT "boards_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupMembers" ADD CONSTRAINT "_GroupMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupMembers" ADD CONSTRAINT "_GroupMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
