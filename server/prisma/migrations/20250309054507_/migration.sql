-- CreateTable
CREATE TABLE "_Views" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_Views_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_Views_B_index" ON "_Views"("B");

-- AddForeignKey
ALTER TABLE "_Views" ADD CONSTRAINT "_Views_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Views" ADD CONSTRAINT "_Views_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("username") ON DELETE CASCADE ON UPDATE CASCADE;
