# 🎨 艺术史自测系统

本仓库包含两个独立的子项目：

| 子项目 | 目录 | 说明 |
|--------|------|------|
| **艺术史自测系统** | 根目录 | NestJS 后端 + 原生前端，本地 SQLite，零配置运行 |
| **艺术史学习管理系统** | `art-history/` | Next.js 15 + Supabase，当前提供本地开发说明 |

---

## 🖥️ 艺术史自测系统（根目录）

一套面向西方艺术史与世界艺术史爱好者的**在线自测平台**，题库改编自耶鲁大学、哈佛大学、考陶尔德艺术研究院（Courtauld Institute）、斯莱德美术学院（Slade School of Fine Art）等权威机构的艺术史课程考题，**中文翻译版，附详细解析**。

### ✨ 功能特色

- 📚 **66 道题库** — 涵盖古代、中世纪、文艺复兴、巴洛克、现代、当代及非西方艺术
- 🎯 **多题型支持** — 单选、多选、判断题
- 🔄 **定时同步新题** — 每天早上 8:00 从外部网站同步最新 10 道题并自动去重
- ⚙️ **自定义出题** — 按时期、难度、数量灵活筛选
- 📊 **答题记录** — 历史成绩、正确率统计、随时回顾
- 🧠 **智能练习池** — 只抽取“未做过 + 做错过但尚未做对”的题目
- 📖 **题库浏览** — 可按时期/关键词搜索，展开查看解析
- 🗄️ **本地 SQLite 数据库** — 零配置，直接运行

### 🚀 本地快速运行

#### 环境要求

- Node.js ≥ 18
- npm ≥ 8

#### 步骤

```bash
# 1. 克隆项目
git clone https://github.com/sanchez0623/art_exam_sys.git
cd art_exam_sys

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run start:dev
```

启动后访问：[http://localhost:3000](http://localhost:3000)

> **首次启动**会自动创建基础题库；若需每日同步外部新题，请参考下方“外部题源配置”。

#### 生产运行

```bash
npm run build
npm run start:prod
```

### 📁 项目结构

```
art_exam_sys/
├── src/
│   ├── questions/         # 题库模块（增删查）
│   ├── quiz/              # 考试模块（答题、计分、历史）
│   ├── scheduler/         # 定时任务（每日8:00同步外部新题）
│   ├── question-sync/     # 外部题源同步模块
│   ├── seed/              # 初始题库数据（66 道题）
│   └── app.module.ts      # 根模块
├── public/                # 前端静态文件
│   ├── index.html
│   ├── style.css
│   └── app.js
├── data/                  # SQLite 数据库（运行时生成，已 gitignore）
├── art-history/           # Next.js 学习管理子项目
└── package.json
```

### 🔌 API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/questions` | 获取题目列表（支持 `period`, `difficulty`, `search` 筛选）|
| GET | `/api/questions/count` | 题库题目总数 |
| GET | `/api/questions/:id` | 获取单道题目详情 |
| POST | `/api/questions` | 新增题目 |
| DELETE | `/api/questions/:id` | 删除题目 |
| POST | `/api/questions/sync` | 手动触发外部题源同步（支持 `count`） |
| POST | `/api/quiz/start` | 开始一场考试（优先抽取错题，其次新题；支持 `count`, `period`, `difficulty`）|
| GET | `/api/quiz/sessions` | 历史考试记录（支持 `page`, `limit` 分页）|
| GET | `/api/quiz/stats` | 统计数据 |
| GET | `/api/quiz/:id` | 获取某场考试详情 |
| POST | `/api/quiz/:id/answer` | 提交答案（`questionId`, `answer`）|
| POST | `/api/quiz/:id/complete` | 结束考试 |

### 📜 题库来源

题目改编自以下机构的艺术史课程考题，经中文翻译，并在种子数据中保留结构化来源机构与官网链接元数据：

- 耶鲁大学（Yale University）— 艺术史导论、文艺复兴艺术、现代艺术史
- 哈佛大学（Harvard University）— 世界艺术史、印象派与现代主义
- 考陶尔德艺术研究院（Courtauld Institute of Art，伦敦）— 各时期专题
- 斯莱德美术学院（Slade School of Fine Art）— 艺术史笔试

### 🔄 外部题源配置

每日同步能力默认会按以下顺序读取配置：

1. 环境变量 `EXAM_QUESTION_SOURCES_JSON`
2. 项目根目录下的 `data/question-sync-sources.json`
3. 仓库自带的 `question-sync-sources.example.json`

仓库已内置一份可直接使用的示例题源配置，因此本地启动后点击“同步题库”即可完成一次同步。若需替换为你自己的正式题源，可复制 [question-sync-sources.example.json](question-sync-sources.example.json) 到 `data/question-sync-sources.json` 再修改。支持两类题源：

- `html`：通过 CSS 选择器抓取网页题目
- `json`：通过字段映射读取题目接口，或直接在配置里提供 `items`

系统会基于题干标准化后的 `SHA-256` 哈希去重，避免重复入库。

### 🛠️ 技术栈

- **后端**：NestJS 11 + TypeScript
- **数据库**：SQLite（via TypeORM + better-sqlite3）
- **定时任务**：@nestjs/schedule（node-cron）
- **前端**：原生 HTML / CSS / JavaScript（由 NestJS 静态服务）

---

## 📘 艺术史学习管理系统（`art-history/`）

个人艺术史学习与管理系统，基于 **Next.js 15 App Router + TypeScript + Tailwind CSS + Supabase** 构建。

### ✨ 功能模块

| 模块 | 说明 |
|------|------|
| Auth | 登录 / 注册（Supabase Auth） |
| Artists | 艺术家 CRUD + 图片上传 + 标签 |
| Artworks | 作品 CRUD + 图片上传 + 标签 + 关联艺术家/时期 |
| Periods | 艺术时期管理 |
| Tags | 标签管理（颜色支持） |
| Notes | 个人笔记（可关联任意实体） |
| Favorites | 收藏夹（艺术家 / 作品） |
| Search | 全局搜索（跨所有实体） |
| Notion Sync | 从 Notion 数据库同步专题文章 |

### 🚀 快速开始

```bash
# 1. 进入目录
cd art-history

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env.local
# 填写 NEXT_PUBLIC_SUPABASE_URL / ANON_KEY / SERVICE_ROLE_KEY / NOTION_API_KEY

# 4. 在 Supabase Dashboard 运行 SQL migration
# supabase/migrations/20240101000000_initial_schema.sql

# 5. 创建 Storage bucket
# Supabase Dashboard > Storage > New bucket > "art-images" (public)

# 6. 启动开发服务器
npm run dev
```

### 🔑 环境变量

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NOTION_API_KEY=secret_your_notion_integration_token
NOTION_ARTICLES_DATABASE_ID=your-notion-database-id
NOTION_SYNC_SECRET=your-random-secret
```

### 🛠️ 技术栈

- **框架**：Next.js 15 App Router + TypeScript
- **数据库**：Supabase（PostgreSQL + Row Level Security）
- **样式**：Tailwind CSS
- **认证**：Supabase Auth（@supabase/ssr）
- **存储**：Supabase Storage
- **部署**：当前仓库仅维护根目录项目的 Netlify 部署配置

详细文档请参阅 [art-history/README.md](art-history/README.md)。

### ☁️ 部署说明

当前仓库**仅保留 Netlify 部署方式**，对应的是根目录下的「艺术史自测系统」：

- Netlify 配置文件：[`netlify.toml`](netlify.toml)
- Serverless 入口：[`netlify/functions/api.js`](netlify/functions/api.js)
- 构建命令：`npm run build`

`art-history/` 子项目当前只保留本地开发与构建说明；如后续需要其他部署方式，再单独补充。

---

## 📄 License

UNLICENSED — 仅供学习与个人使用。
