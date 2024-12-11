-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "auth_type" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "active" INTEGER NOT NULL DEFAULT 1,
    "current_active_company_id" INTEGER,
    "notification_preferences" TEXT,
    "voting_rights" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "password" TEXT,
    "secret_question_1_id" INTEGER,
    "secret_answer_1" TEXT,
    "secret_question_2_id" INTEGER,
    "secret_answer_2" TEXT,
    "secret_question_3_id" INTEGER,
    "secret_answer_3" TEXT,
    "password_expiration" DATETIME,
    "questions_expiration" DATETIME,
    "last_login" DATETIME,
    CONSTRAINT "User_secret_question_1_id_fkey" FOREIGN KEY ("secret_question_1_id") REFERENCES "SecretQuestion" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_secret_question_2_id_fkey" FOREIGN KEY ("secret_question_2_id") REFERENCES "SecretQuestion" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_secret_question_3_id_fkey" FOREIGN KEY ("secret_question_3_id") REFERENCES "SecretQuestion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SecretQuestion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "question" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
