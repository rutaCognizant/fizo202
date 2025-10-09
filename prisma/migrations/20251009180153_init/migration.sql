-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "age" INTEGER,
    "gender" TEXT
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pushups" INTEGER NOT NULL DEFAULT 0,
    "crunches" INTEGER NOT NULL DEFAULT 0,
    "running" INTEGER NOT NULL DEFAULT 0,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PushupPoints" (
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,

    PRIMARY KEY ("age", "gender", "count")
);

-- CreateTable
CREATE TABLE "CrunchesPoints" (
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,

    PRIMARY KEY ("age", "gender", "count")
);

-- CreateTable
CREATE TABLE "RunningPoints" (
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "seconds" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,

    PRIMARY KEY ("age", "gender", "seconds")
);
