-- ============================================================
-- QUIZ HUB AI — SQL Setup Script
-- Database: HUNGSILVER.MyAppDb
-- ============================================================

USE [HUNGSILVER.MyAppDb];
GO

-- ============================================================
-- 1. CREATE TABLES
-- ============================================================

-- 1.1 QuestionCategories
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'QuestionCategories')
BEGIN
    CREATE TABLE [dbo].[QuestionCategories] (
        [Id]              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID() PRIMARY KEY,
        [Name]            NVARCHAR(100)    NOT NULL,
        [Color]           NVARCHAR(20)     NOT NULL DEFAULT '#6366f1',
        [IsDelete]        BIT              NOT NULL DEFAULT 0,
        [CreatedDate]     DATETIME2        NULL,
        [UpdatedDate]     DATETIME2        NULL,
        [CreatedUserName] NVARCHAR(60)     NULL,
        [UpdatedUserName] NVARCHAR(60)     NULL
    );
    PRINT 'Created table: QuestionCategories';
END
ELSE
    PRINT 'Table already exists: QuestionCategories';
GO

-- 1.2 Questions
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Questions')
BEGIN
    CREATE TABLE [dbo].[Questions] (
        [Id]               UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID() PRIMARY KEY,
        [Text]             NVARCHAR(MAX)    NOT NULL,
        [MainImg]          NVARCHAR(MAX)    NULL,
        [Audio]            NVARCHAR(MAX)    NULL,
        [AnsL]             NVARCHAR(500)    NOT NULL,
        [AnsR]             NVARCHAR(500)    NOT NULL,
        [ImgL]             NVARCHAR(MAX)    NULL,
        [ImgR]             NVARCHAR(MAX)    NULL,
        [CorrectSide]      NVARCHAR(1)      NOT NULL DEFAULT 'L',
        [CategoryId]       UNIQUEIDENTIFIER NULL,
        [Difficulty]       NVARCHAR(10)     NOT NULL DEFAULT 'Medium',
        [Points]           INT              NOT NULL DEFAULT 200,
        [Explanation]      NVARCHAR(MAX)    NULL,
        [TimesShown]       INT              NOT NULL DEFAULT 0,
        [TimesCorrect]     INT              NOT NULL DEFAULT 0,
        [TotalTimeTakenMs] BIGINT           NOT NULL DEFAULT 0,
        [IsDelete]         BIT              NOT NULL DEFAULT 0,
        [CreatedDate]      DATETIME2        NULL,
        [UpdatedDate]      DATETIME2        NULL,
        [CreatedUserName]  NVARCHAR(60)     NULL,
        [UpdatedUserName]  NVARCHAR(60)     NULL,
        CONSTRAINT [FK_Questions_Categories] FOREIGN KEY ([CategoryId])
            REFERENCES [dbo].[QuestionCategories]([Id])
    );
    PRINT 'Created table: Questions';
END
ELSE
    PRINT 'Table already exists: Questions';
GO

-- 1.3 QuizGames
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'QuizGames')
BEGIN
    CREATE TABLE [dbo].[QuizGames] (
        [Id]              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID() PRIMARY KEY,
        [Title]           NVARCHAR(200)    NOT NULL,
        [Description]     NVARCHAR(500)    NULL,
        [ShufQ]           BIT              NOT NULL DEFAULT 0,
        [ShufA]           BIT              NOT NULL DEFAULT 0,
        [BonusTime]       BIT              NOT NULL DEFAULT 1,
        [StreakBonus]     BIT              NOT NULL DEFAULT 1,
        [WrongPenalty]    INT              NOT NULL DEFAULT 0,
        [CreatedById]     UNIQUEIDENTIFIER NULL,
        [IsDelete]        BIT              NOT NULL DEFAULT 0,
        [CreatedDate]     DATETIME2        NULL,
        [UpdatedDate]     DATETIME2        NULL,
        [CreatedUserName] NVARCHAR(60)     NULL,
        [UpdatedUserName] NVARCHAR(60)     NULL
    );
    PRINT 'Created table: QuizGames';
END
ELSE
    PRINT 'Table already exists: QuizGames';
GO

-- 1.4 GameQuestions
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'GameQuestions')
BEGIN
    CREATE TABLE [dbo].[GameQuestions] (
        [Id]              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID() PRIMARY KEY,
        [GameId]          UNIQUEIDENTIFIER NOT NULL,
        [QuestionId]      UNIQUEIDENTIFIER NOT NULL,
        [Order]           INT              NOT NULL DEFAULT 0,
        [IsDelete]        BIT              NOT NULL DEFAULT 0,
        [CreatedDate]     DATETIME2        NULL,
        [UpdatedDate]     DATETIME2        NULL,
        [CreatedUserName] NVARCHAR(60)     NULL,
        [UpdatedUserName] NVARCHAR(60)     NULL,
        CONSTRAINT [FK_GameQuestions_Game]     FOREIGN KEY ([GameId])     REFERENCES [dbo].[QuizGames]([Id]),
        CONSTRAINT [FK_GameQuestions_Question] FOREIGN KEY ([QuestionId]) REFERENCES [dbo].[Questions]([Id])
    );
    PRINT 'Created table: GameQuestions';
END
ELSE
    PRINT 'Table already exists: GameQuestions';
GO

-- 1.5 GameSessions
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'GameSessions')
BEGIN
    CREATE TABLE [dbo].[GameSessions] (
        [Id]               UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID() PRIMARY KEY,
        [GameId]           UNIQUEIDENTIFIER NOT NULL,
        [PlayerName]       NVARCHAR(100)    NOT NULL DEFAULT 'Guest',
        [Score]            INT              NOT NULL DEFAULT 0,
        [MaxScore]         INT              NOT NULL DEFAULT 0,
        [CorrectCount]     INT              NOT NULL DEFAULT 0,
        [WrongCount]       INT              NOT NULL DEFAULT 0,
        [StreakMax]        INT              NOT NULL DEFAULT 0,
        [TotalTimeSeconds] INT              NOT NULL DEFAULT 0,
        [IsDelete]         BIT              NOT NULL DEFAULT 0,
        [CreatedDate]      DATETIME2        NULL,
        [UpdatedDate]      DATETIME2        NULL,
        [CreatedUserName]  NVARCHAR(60)     NULL,
        [UpdatedUserName]  NVARCHAR(60)     NULL,
        CONSTRAINT [FK_GameSessions_Game] FOREIGN KEY ([GameId]) REFERENCES [dbo].[QuizGames]([Id])
    );
    PRINT 'Created table: GameSessions';
END
ELSE
    PRINT 'Table already exists: GameSessions';
GO

-- 1.6 SessionDetails
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'SessionDetails')
BEGIN
    CREATE TABLE [dbo].[SessionDetails] (
        [Id]              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID() PRIMARY KEY,
        [SessionId]       UNIQUEIDENTIFIER NOT NULL,
        [QuestionId]      UNIQUEIDENTIFIER NOT NULL,
        [IsCorrect]       BIT              NOT NULL DEFAULT 0,
        [TimeTakenMs]     INT              NOT NULL DEFAULT 0,
        [EarnedPoints]    INT              NOT NULL DEFAULT 0,
        [ChosenSide]      NVARCHAR(1)      NOT NULL DEFAULT 'L',
        [IsDelete]        BIT              NOT NULL DEFAULT 0,
        [CreatedDate]     DATETIME2        NULL,
        [UpdatedDate]     DATETIME2        NULL,
        [CreatedUserName] NVARCHAR(60)     NULL,
        [UpdatedUserName] NVARCHAR(60)     NULL,
        CONSTRAINT [FK_SessionDetails_Session]  FOREIGN KEY ([SessionId])  REFERENCES [dbo].[GameSessions]([Id]),
        CONSTRAINT [FK_SessionDetails_Question] FOREIGN KEY ([QuestionId]) REFERENCES [dbo].[Questions]([Id])
    );
    PRINT 'Created table: SessionDetails';
END
ELSE
    PRINT 'Table already exists: SessionDetails';
GO

PRINT '=== All tables ready ===';
GO

-- ============================================================
-- 2. SAMPLE DATA
-- ============================================================

-- Khai báo GUID cố định để FK references hoạt động
DECLARE
    -- Categories
    @catLapTrinh  UNIQUEIDENTIFIER = '11111111-0000-0000-0000-000000000001',
    @catKhoaHoc   UNIQUEIDENTIFIER = '11111111-0000-0000-0000-000000000002',
    @catLichSu    UNIQUEIDENTIFIER = '11111111-0000-0000-0000-000000000003',
    @catTiengAnh  UNIQUEIDENTIFIER = '11111111-0000-0000-0000-000000000004',
    @catToanHoc   UNIQUEIDENTIFIER = '11111111-0000-0000-0000-000000000005',

    -- Questions — Lập trình
    @q1  UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000001',
    @q2  UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000002',
    @q3  UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000003',
    @q4  UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000004',
    @q5  UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000005',
    -- Questions — Khoa học
    @q6  UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000006',
    @q7  UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000007',
    @q8  UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000008',
    @q9  UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000009',
    @q10 UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000010',
    -- Questions — Lịch sử
    @q11 UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000011',
    @q12 UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000012',
    @q13 UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000013',
    @q14 UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000014',
    -- Questions — Tiếng Anh
    @q15 UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000015',
    @q16 UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000016',
    @q17 UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000017',
    @q18 UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000018',
    -- Questions — Toán học
    @q19 UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000019',
    @q20 UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000020',

    -- Games
    @game1 UNIQUEIDENTIFIER = '33333333-0000-0000-0000-000000000001',
    @game2 UNIQUEIDENTIFIER = '33333333-0000-0000-0000-000000000002',
    @game3 UNIQUEIDENTIFIER = '33333333-0000-0000-0000-000000000003',

    -- Sessions
    @sess1 UNIQUEIDENTIFIER = '44444444-0000-0000-0000-000000000001',
    @sess2 UNIQUEIDENTIFIER = '44444444-0000-0000-0000-000000000002',
    @sess3 UNIQUEIDENTIFIER = '44444444-0000-0000-0000-000000000003';

-- ---- 2.1 Categories ----
IF NOT EXISTS (SELECT 1 FROM QuestionCategories WHERE Id = '11111111-0000-0000-0000-000000000001')
BEGIN
    INSERT INTO [dbo].[QuestionCategories] (Id, Name, Color, IsDelete, CreatedDate)
    VALUES
        (@catLapTrinh, N'Lập trình',  '#3b82f6', 0, GETDATE()),
        (@catKhoaHoc,  N'Khoa học',   '#10b981', 0, GETDATE()),
        (@catLichSu,   N'Lịch sử',    '#f59e0b', 0, GETDATE()),
        (@catTiengAnh, N'Tiếng Anh',  '#8b5cf6', 0, GETDATE()),
        (@catToanHoc,  N'Toán học',   '#ef4444', 0, GETDATE());
    PRINT 'Inserted 5 categories';
END
ELSE
    PRINT 'Categories already exist, skipping';

-- ---- 2.2 Questions ----
IF NOT EXISTS (SELECT 1 FROM Questions WHERE Id = '22222222-0000-0000-0000-000000000001')
BEGIN
    -- === LẬP TRÌNH ===
    INSERT INTO [dbo].[Questions]
        (Id, Text, AnsL, AnsR, CorrectSide, CategoryId, Difficulty, Points, Explanation, IsDelete, CreatedDate)
    VALUES
    (@q1,
     N'Ngôn ngữ nào được dùng để phát triển web frontend phổ biến nhất hiện nay?',
     N'JavaScript', N'COBOL', 'L', @catLapTrinh, 'Easy', 100,
     N'JavaScript là ngôn ngữ lập trình duy nhất chạy trực tiếp trên trình duyệt web.', 0, GETDATE()),

    (@q2,
     N'Git là gì?',
     N'Hệ thống kiểm soát phiên bản phân tán', N'Ngôn ngữ lập trình hướng đối tượng', 'L', @catLapTrinh, 'Easy', 100,
     N'Git là distributed version control system, giúp theo dõi lịch sử thay đổi code.', 0, GETDATE()),

    (@q3,
     N'Trong C#, "async/await" dùng để làm gì?',
     N'Lập trình bất đồng bộ (asynchronous)', N'Khai báo biến tĩnh (static)', 'L', @catLapTrinh, 'Medium', 200,
     N'async/await giúp viết code bất đồng bộ theo cú pháp tuần tự, tránh callback hell.', 0, GETDATE()),

    (@q4,
     N'REST API thường trả về dữ liệu theo định dạng nào?',
     N'XML là định dạng phổ biến nhất', N'JSON là định dạng phổ biến nhất', 'R', @catLapTrinh, 'Easy', 100,
     N'JSON (JavaScript Object Notation) nhẹ hơn XML và được hỗ trợ rộng rãi bởi hầu hết ngôn ngữ.', 0, GETDATE()),

    (@q5,
     N'Big O notation O(n²) mô tả thuật toán nào sau đây?',
     N'Bubble Sort', N'Binary Search', 'L', @catLapTrinh, 'Hard', 300,
     N'Bubble Sort có độ phức tạp O(n²) trong trường hợp trung bình và tệ nhất do vòng lặp lồng nhau.', 0, GETDATE()),

    -- === KHOA HỌC ===
    (@q6,
     N'Hành tinh nào lớn nhất trong Hệ Mặt Trời?',
     N'Sao Mộc (Jupiter)', N'Sao Thổ (Saturn)', 'L', @catKhoaHoc, 'Easy', 100,
     N'Sao Mộc là hành tinh lớn nhất với khối lượng gấp 2,5 lần tổng tất cả hành tinh còn lại.', 0, GETDATE()),

    (@q7,
     N'Công thức E = mc² được phát minh bởi ai?',
     N'Isaac Newton', N'Albert Einstein', 'R', @catKhoaHoc, 'Easy', 100,
     N'Albert Einstein đề xuất phương trình nổi tiếng này năm 1905 trong thuyết tương đối đặc biệt.', 0, GETDATE()),

    (@q8,
     N'Tốc độ ánh sáng trong chân không xấp xỉ bao nhiêu?',
     N'300.000 km/s', N'150.000 km/s', 'L', @catKhoaHoc, 'Medium', 200,
     N'Tốc độ ánh sáng trong chân không là 299.792.458 m/s, thường làm tròn thành 300.000 km/s.', 0, GETDATE()),

    (@q9,
     N'DNA có cấu trúc dạng gì?',
     N'Xoắn kép (double helix)', N'Chuỗi đơn thẳng', 'L', @catKhoaHoc, 'Medium', 200,
     N'James Watson và Francis Crick mô tả cấu trúc xoắn kép của DNA năm 1953.', 0, GETDATE()),

    (@q10,
     N'Nguyên tố nào có số hiệu nguyên tử là 1?',
     N'Helium (He)', N'Hydrogen (H)', 'R', @catKhoaHoc, 'Easy', 100,
     N'Hydro (H) có số hiệu nguyên tử là 1, là nguyên tố nhẹ nhất và phổ biến nhất trong vũ trụ.', 0, GETDATE()),

    -- === LỊCH SỬ ===
    (@q11,
     N'Việt Nam tuyên bố độc lập năm nào?',
     N'1945', N'1954', 'L', @catLichSu, 'Easy', 100,
     N'Ngày 2/9/1945, Chủ tịch Hồ Chí Minh đọc Tuyên ngôn Độc lập tại Quảng trường Ba Đình.', 0, GETDATE()),

    (@q12,
     N'Chiến dịch Điện Biên Phủ diễn ra năm nào?',
     N'1954', N'1975', 'L', @catLichSu, 'Medium', 200,
     N'Chiến dịch Điện Biên Phủ kết thúc ngày 7/5/1954, chấm dứt sự chiếm đóng của Pháp tại Đông Dương.', 0, GETDATE()),

    (@q13,
     N'Thành Cổ Loa được xây dựng dưới thời vua nào?',
     N'An Dương Vương (Thục Phán)', N'Hùng Vương thứ 18', 'L', @catLichSu, 'Hard', 300,
     N'Thục Phán (An Dương Vương) xây thành Cổ Loa khoảng thế kỷ 3 trước Công nguyên.', 0, GETDATE()),

    (@q14,
     N'Cuộc Cách mạng Công nghiệp lần đầu tiên bắt đầu ở nước nào?',
     N'Anh (England)', N'Pháp (France)', 'L', @catLichSu, 'Medium', 200,
     N'Anh là quốc gia khởi đầu Cách mạng Công nghiệp vào thế kỷ 18 với phát minh máy hơi nước.', 0, GETDATE()),

    -- === TIẾNG ANH ===
    (@q15,
     N'Từ nào là đồng nghĩa với "happy"?',
     N'Joyful', N'Sorrowful', 'L', @catTiengAnh, 'Easy', 100,
     N'"Joyful" có nghĩa là vui vẻ, hạnh phúc — đồng nghĩa với "happy". "Sorrowful" có nghĩa buồn bã.', 0, GETDATE()),

    (@q16,
     N'Câu nào dùng thì hiện tại hoàn thành (Present Perfect) đúng?',
     N'I have eaten breakfast already', N'I ate breakfast yesterday', 'L', @catTiengAnh, 'Medium', 200,
     N'Present Perfect dùng "have/has + V3" để nói về hành động hoàn thành có liên quan đến hiện tại.', 0, GETDATE()),

    (@q17,
     N'"Ubiquitous" có nghĩa là gì?',
     N'Hiếm gặp, quý hiếm', N'Có mặt khắp nơi, phổ biến', 'R', @catTiengAnh, 'Hard', 300,
     N'"Ubiquitous" = present, appearing, or found everywhere (có mặt khắp nơi, phổ biến rộng rãi).', 0, GETDATE()),

    (@q18,
     N'Thành ngữ "Break a leg" có nghĩa là gì trong tiếng Anh?',
     N'Bẻ gãy chân', N'Chúc may mắn', 'R', @catTiengAnh, 'Medium', 200,
     N'"Break a leg" là thành ngữ dùng để chúc ai đó may mắn, thường trước khi biểu diễn sân khấu.', 0, GETDATE()),

    -- === TOÁN HỌC ===
    (@q19,
     N'Số π (Pi) gần đúng bằng bao nhiêu?',
     N'3.14159...', N'2.71828...', 'L', @catToanHoc, 'Easy', 100,
     N'π ≈ 3.14159... là tỷ số giữa chu vi và đường kính của hình tròn. Số 2.71828 là số e (Euler).', 0, GETDATE()),

    (@q20,
     N'Định lý Pythagoras áp dụng cho tam giác nào?',
     N'Tam giác vuông (right triangle)', N'Tam giác đều (equilateral triangle)', 'L', @catToanHoc, 'Medium', 200,
     N'a² + b² = c² chỉ áp dụng cho tam giác vuông, trong đó c là cạnh huyền (cạnh đối diện góc vuông).', 0, GETDATE());

    PRINT 'Inserted 20 questions';
END
ELSE
    PRINT 'Questions already exist, skipping';

-- ---- 2.3 Quiz Games ----
IF NOT EXISTS (SELECT 1 FROM QuizGames WHERE Id = '33333333-0000-0000-0000-000000000001')
BEGIN
    INSERT INTO [dbo].[QuizGames]
        (Id, Title, Description, ShufQ, ShufA, BonusTime, StreakBonus, WrongPenalty, IsDelete, CreatedDate)
    VALUES
    (@game1,
     N'🖥️ Lập trình căn bản',
     N'Kiểm tra kiến thức lập trình cơ bản: JavaScript, Git, C#, API và thuật toán.',
     1, 0, 1, 1, 0, 0, GETDATE()),

    (@game2,
     N'🌍 Kiến thức tổng hợp',
     N'Kết hợp Khoa học, Lịch sử và Toán học — thử thách trí tuệ toàn diện!',
     1, 0, 1, 1, 50, 0, GETDATE()),

    (@game3,
     N'🇬🇧 Tiếng Anh thực chiến',
     N'Từ vựng, ngữ pháp và thành ngữ tiếng Anh thông dụng.',
     0, 0, 1, 0, 0, 0, GETDATE());

    PRINT 'Inserted 3 games';
END
ELSE
    PRINT 'Games already exist, skipping';

-- ---- 2.4 Game Questions ----
IF NOT EXISTS (SELECT 1 FROM GameQuestions WHERE GameId = '33333333-0000-0000-0000-000000000001')
BEGIN
    -- Game 1: Lập trình (q1–q5)
    INSERT INTO [dbo].[GameQuestions] (Id, GameId, QuestionId, [Order], IsDelete, CreatedDate)
    VALUES
    (NEWID(), @game1, @q1, 1, 0, GETDATE()),
    (NEWID(), @game1, @q2, 2, 0, GETDATE()),
    (NEWID(), @game1, @q3, 3, 0, GETDATE()),
    (NEWID(), @game1, @q4, 4, 0, GETDATE()),
    (NEWID(), @game1, @q5, 5, 0, GETDATE());

    -- Game 2: Kiến thức tổng hợp (q6–q14, q19–q20)
    INSERT INTO [dbo].[GameQuestions] (Id, GameId, QuestionId, [Order], IsDelete, CreatedDate)
    VALUES
    (NEWID(), @game2, @q6,  1, 0, GETDATE()),
    (NEWID(), @game2, @q7,  2, 0, GETDATE()),
    (NEWID(), @game2, @q8,  3, 0, GETDATE()),
    (NEWID(), @game2, @q9,  4, 0, GETDATE()),
    (NEWID(), @game2, @q10, 5, 0, GETDATE()),
    (NEWID(), @game2, @q11, 6, 0, GETDATE()),
    (NEWID(), @game2, @q12, 7, 0, GETDATE()),
    (NEWID(), @game2, @q13, 8, 0, GETDATE()),
    (NEWID(), @game2, @q14, 9, 0, GETDATE()),
    (NEWID(), @game2, @q19,10, 0, GETDATE()),
    (NEWID(), @game2, @q20,11, 0, GETDATE());

    -- Game 3: Tiếng Anh (q15–q18)
    INSERT INTO [dbo].[GameQuestions] (Id, GameId, QuestionId, [Order], IsDelete, CreatedDate)
    VALUES
    (NEWID(), @game3, @q15, 1, 0, GETDATE()),
    (NEWID(), @game3, @q16, 2, 0, GETDATE()),
    (NEWID(), @game3, @q17, 3, 0, GETDATE()),
    (NEWID(), @game3, @q18, 4, 0, GETDATE());

    PRINT 'Inserted game questions';
END
ELSE
    PRINT 'Game questions already exist, skipping';

-- ---- 2.5 Game Sessions (lịch sử chơi mẫu) ----
IF NOT EXISTS (SELECT 1 FROM GameSessions WHERE Id = '44444444-0000-0000-0000-000000000001')
BEGIN
    INSERT INTO [dbo].[GameSessions]
        (Id, GameId, PlayerName, Score, MaxScore, CorrectCount, WrongCount, StreakMax, TotalTimeSeconds, IsDelete, CreatedDate)
    VALUES
    -- Lượt 1: Game Lập trình, người chơi An
    (@sess1, @game1, N'Nguyễn Văn An', 750, 1000, 4, 1, 3, 62, 0, GETDATE()),
    -- Lượt 2: Game Lập trình, người chơi Bình
    (@sess2, @game1, N'Trần Thị Bình', 500, 1000, 3, 2, 2, 78, 0, GETDATE()),
    -- Lượt 3: Game Tiếng Anh, người chơi An
    (@sess3, @game3, N'Nguyễn Văn An', 700, 800, 3, 1, 2, 45, 0, GETDATE());

    PRINT 'Inserted 3 game sessions';
END
ELSE
    PRINT 'Game sessions already exist, skipping';

-- ---- 2.6 Session Details ----
IF NOT EXISTS (SELECT 1 FROM SessionDetails WHERE SessionId = '44444444-0000-0000-0000-000000000001')
BEGIN
    -- Session 1 (Game Lập trình — An): 4 đúng, 1 sai
    INSERT INTO [dbo].[SessionDetails]
        (Id, SessionId, QuestionId, IsCorrect, TimeTakenMs, EarnedPoints, ChosenSide, IsDelete, CreatedDate)
    VALUES
    (NEWID(), @sess1, @q1, 1,  3200, 150, 'L', 0, GETDATE()),  -- q1 đúng (L), 3.2s
    (NEWID(), @sess1, @q2, 1,  2800, 125, 'L', 0, GETDATE()),  -- q2 đúng, có time bonus
    (NEWID(), @sess1, @q3, 1,  5100, 200, 'L', 0, GETDATE()),  -- q3 đúng
    (NEWID(), @sess1, @q4, 0,  8900,   0, 'L', 0, GETDATE()),  -- q4 sai (chọn L, đúng là R)
    (NEWID(), @sess1, @q5, 1, 11200, 275, 'L', 0, GETDATE());  -- q5 đúng (streak bonus)

    -- Session 2 (Game Lập trình — Bình): 3 đúng, 2 sai
    INSERT INTO [dbo].[SessionDetails]
        (Id, SessionId, QuestionId, IsCorrect, TimeTakenMs, EarnedPoints, ChosenSide, IsDelete, CreatedDate)
    VALUES
    (NEWID(), @sess2, @q1, 1,  4500, 100, 'L', 0, GETDATE()),
    (NEWID(), @sess2, @q2, 0,  6200,   0, 'R', 0, GETDATE()),  -- sai
    (NEWID(), @sess2, @q3, 1,  7800, 200, 'L', 0, GETDATE()),
    (NEWID(), @sess2, @q4, 1,  3100, 150, 'R', 0, GETDATE()),  -- đúng, time bonus
    (NEWID(), @sess2, @q5, 0, 13000,   0, 'R', 0, GETDATE()); -- sai

    -- Session 3 (Game Tiếng Anh — An): 3 đúng, 1 sai
    INSERT INTO [dbo].[SessionDetails]
        (Id, SessionId, QuestionId, IsCorrect, TimeTakenMs, EarnedPoints, ChosenSide, IsDelete, CreatedDate)
    VALUES
    (NEWID(), @sess3, @q15, 1,  2900, 150, 'L', 0, GETDATE()),
    (NEWID(), @sess3, @q16, 1,  5400, 200, 'L', 0, GETDATE()),
    (NEWID(), @sess3, @q17, 0,  9100,   0, 'L', 0, GETDATE()),  -- sai (đúng là R)
    (NEWID(), @sess3, @q18, 1,  6700, 350, 'R', 0, GETDATE()); -- đúng + streak bonus

    PRINT 'Inserted session details';
END
ELSE
    PRINT 'Session details already exist, skipping';

-- ---- 2.7 Cập nhật thống kê câu hỏi từ session data ----
-- TimesShown, TimesCorrect dựa trên SessionDetails đã insert
UPDATE [dbo].[Questions] SET TimesShown = 3, TimesCorrect = 2 WHERE Id = @q1;  -- 2 đúng / 3 lần
UPDATE [dbo].[Questions] SET TimesShown = 3, TimesCorrect = 2 WHERE Id = @q2;
UPDATE [dbo].[Questions] SET TimesShown = 3, TimesCorrect = 2 WHERE Id = @q3;
UPDATE [dbo].[Questions] SET TimesShown = 3, TimesCorrect = 2 WHERE Id = @q4;
UPDATE [dbo].[Questions] SET TimesShown = 3, TimesCorrect = 1 WHERE Id = @q5;  -- khó nhất
UPDATE [dbo].[Questions] SET TimesShown = 1, TimesCorrect = 1 WHERE Id = @q15;
UPDATE [dbo].[Questions] SET TimesShown = 1, TimesCorrect = 1 WHERE Id = @q16;
UPDATE [dbo].[Questions] SET TimesShown = 1, TimesCorrect = 0 WHERE Id = @q17; -- khó
UPDATE [dbo].[Questions] SET TimesShown = 1, TimesCorrect = 1 WHERE Id = @q18;

PRINT '';
PRINT '=== Sample data inserted successfully ===';
GO

-- ============================================================
-- 3. KIỂM TRA KẾT QUẢ
-- ============================================================
SELECT 'QuestionCategories' AS [Table], COUNT(*) AS [Rows] FROM QuestionCategories WHERE IsDelete = 0
UNION ALL
SELECT 'Questions',  COUNT(*) FROM Questions  WHERE IsDelete = 0
UNION ALL
SELECT 'QuizGames',  COUNT(*) FROM QuizGames  WHERE IsDelete = 0
UNION ALL
SELECT 'GameQuestions', COUNT(*) FROM GameQuestions WHERE IsDelete = 0
UNION ALL
SELECT 'GameSessions',  COUNT(*) FROM GameSessions  WHERE IsDelete = 0
UNION ALL
SELECT 'SessionDetails',COUNT(*) FROM SessionDetails WHERE IsDelete = 0;
GO

-- Xem leaderboard game 1
SELECT
    ROW_NUMBER() OVER (ORDER BY Score DESC) AS [Rank],
    PlayerName,
    Score,
    MaxScore,
    CorrectCount,
    WrongCount,
    StreakMax,
    TotalTimeSeconds,
    CreatedDate AS PlayedAt
FROM GameSessions
WHERE GameId = '33333333-0000-0000-0000-000000000001'
  AND IsDelete = 0
ORDER BY Score DESC;
GO
