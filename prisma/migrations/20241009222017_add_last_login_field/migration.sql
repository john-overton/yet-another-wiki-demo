-- CreateEnum
CREATE TYPE "AuthType" AS ENUM ('Email', 'Microsoft', 'Google');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Admin', 'PowerUser', 'User');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "auth_type" "AuthType" NOT NULL,
    "role" "Role" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "current_active_company_id" INTEGER,
    "notification_preferences" JSONB,
    "voting_rights" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "password" TEXT NOT NULL,
    "secret_question_1_id" INTEGER NOT NULL,
    "secret_answer_1" TEXT NOT NULL,
    "secret_question_2_id" INTEGER NOT NULL,
    "secret_answer_2" TEXT NOT NULL,
    "secret_question_3_id" INTEGER NOT NULL,
    "secret_answer_3" TEXT NOT NULL,
    "password_expiration" TIMESTAMP(3),
    "questions_expiration" TIMESTAMP(3),
    "last_login" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecretQuestion" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,

    CONSTRAINT "SecretQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_secret_question_1_id_fkey" FOREIGN KEY ("secret_question_1_id") REFERENCES "SecretQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_secret_question_2_id_fkey" FOREIGN KEY ("secret_question_2_id") REFERENCES "SecretQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_secret_question_3_id_fkey" FOREIGN KEY ("secret_question_3_id") REFERENCES "SecretQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
