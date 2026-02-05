-- CreateEnum
CREATE TYPE "Role" AS ENUM ('DOCENTE', 'AYUDANTE', 'ADMIN');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "role" "Role" NOT NULL DEFAULT 'DOCENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("identifier", "token")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "period" TEXT NOT NULL,
    "color" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "courses_userId_key" ON "courses"("userId");

-- CreateTable
CREATE TABLE "sections" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "room" TEXT,
    "schedule" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "sections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sections_courseId_key" ON "sections"("courseId");

-- CreateTable
CREATE TYPE "EventType" AS ENUM ('CLASE', 'EVALUACION', 'ENTREGA', 'REUNION', 'OTRO');

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "EventType" NOT NULL DEFAULT 'CLASE',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "observations" TEXT,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT,
    "sectionId" TEXT,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "events_userId_key" ON "events"("userId");
CREATE INDEX "events_courseId_key" ON "events"("courseId");
CREATE INDEX "events_startDate_key" ON "events"("startDate");

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateTable
CREATE TABLE "event_tags" (
    "eventId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "event_tags_pkey" PRIMARY KEY ("eventId", "tagId")
);

-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "parentFileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "files_userId_key" ON "files"("userId");
CREATE INDEX "files_courseId_key" ON "files"("courseId");

-- CreateTable
CREATE TABLE "event_files" (
    "eventId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,

    CONSTRAINT "event_files_pkey" PRIMARY KEY ("eventId", "fileId")
);

-- CreateTable
CREATE TYPE "QuestionType" AS ENUM ('ALTERNATIVAS', 'DESARROLLO', 'VERDADERO_FALSO', 'EMPAREJAMIENTO');

-- CreateTable
CREATE TYPE "Difficulty" AS ENUM ('FACIL', 'MEDIO', 'DIFICIL');

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "unit" TEXT,
    "points" INTEGER NOT NULL DEFAULT 1,
    "options" JSONB,
    "correctAnswer" TEXT,
    "tags" TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exams" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3),
    "duration" INTEGER,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "allowRandom" BOOLEAN NOT NULL DEFAULT false,
    "showResults" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exams_userId_key" ON "exams"("userId");
CREATE INDEX "exams_courseId_key" ON "exams"("courseId");

-- CreateTable
CREATE TABLE "exam_questions" (
    "examId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,

    CONSTRAINT "exam_questions_pkey" PRIMARY KEY ("examId", "questionId")
);
