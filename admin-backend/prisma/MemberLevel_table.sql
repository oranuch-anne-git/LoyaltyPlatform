-- MemberLevel table (Yellow, Silver, Black) – privilegeDetail = newline-separated benefit text
-- Use for reference; full schema is in tables_script.sql.

CREATE TABLE "MemberLevel" (
    "id"              TEXT NOT NULL PRIMARY KEY,
    "code"            TEXT NOT NULL UNIQUE,
    "name"            TEXT NOT NULL,
    "sortOrder"       INTEGER NOT NULL DEFAULT 0,
    "privilegeDetail" TEXT,
    "createdAt"       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       DATETIME NOT NULL
);
CREATE UNIQUE INDEX "MemberLevel_code_key" ON "MemberLevel"("code");

-- privilegeDetail: plain text only, newline-separated. Sample (Yellow):
-- ลูกค้าใหม่
-- 25 บาท = 1 คะแนน
-- ส่วนลด 3%
-- โปรโมชั่นพิเศษในวันเกิด / คะแนนพิเศษ
-- 800 คะแนน แลกรับส่วนลด 100 บาท
-- คะแนนมีอายุ 3 ปีนับจากวันที่ได้รับ
