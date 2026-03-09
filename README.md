# 🎨 艺术史自测系统

一套面向西方艺术史与世界艺术史爱好者的**在线自测平台**，题库改编自耶鲁大学、哈佛大学、考陶尔德艺术研究院（Courtauld Institute）、斯莱德美术学院（Slade School of Fine Art）等权威机构的艺术史课程考题，**中文翻译版，附详细解析**。

## ✨ 功能特色

- 📚 **66+ 道题库** — 涵盖古代、中世纪、文艺复兴、巴洛克、现代、当代及非西方艺术
- 🎯 **多题型支持** — 单选、多选、判断题
- ⏰ **定时自动出题** — 每天早上 8:00 自动创建每日练习（10 题随机）
- ⚙️ **自定义出题** — 按时期、难度、数量灵活筛选
- 📊 **答题记录** — 历史成绩、正确率统计、随时回顾
- 📖 **题库浏览** — 可按时期/关键词搜索，展开查看解析
- 🗄️ **本地 SQLite 数据库** — 零配置，直接运行

## 🚀 本地快速运行

### 环境要求

- Node.js ≥ 18
- npm ≥ 8

### 步骤

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

> **首次启动**会自动创建 SQLite 数据库并导入 66 道初始题目，无需任何额外配置。

### 生产运行

```bash
npm run build
npm run start:prod
```

## 📁 项目结构

```
art_exam_sys/
├── src/
│   ├── questions/         # 题库模块（增删查）
│   ├── quiz/              # 考试模块（答题、计分、历史）
│   ├── scheduler/         # 定时任务（每日8:00自动出题）
│   ├── seed/              # 初始题库数据（80+ 道题）
│   └── app.module.ts      # 根模块
├── public/                # 前端静态文件
│   ├── index.html
│   ├── style.css
│   └── app.js
├── data/                  # SQLite 数据库（运行时生成，已 gitignore）
└── package.json
```

## 🔌 API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/questions` | 获取题目列表（支持 `period`, `difficulty`, `search` 筛选）|
| GET | `/api/questions/count` | 题库题目总数 |
| POST | `/api/questions` | 新增题目 |
| POST | `/api/quiz/start` | 开始一场考试（支持 `count`, `period`, `difficulty`）|
| GET | `/api/quiz/sessions` | 历史考试记录 |
| GET | `/api/quiz/stats` | 统计数据 |
| GET | `/api/quiz/:id` | 获取某场考试详情 |
| POST | `/api/quiz/:id/answer` | 提交答案 |
| POST | `/api/quiz/:id/complete` | 结束考试 |

## 📜 题库来源

题目改编自以下机构的艺术史课程考题，经中文翻译：

- 耶鲁大学（Yale University）— 艺术史导论、文艺复兴艺术、现代艺术史
- 哈佛大学（Harvard University）— 世界艺术史、印象派与现代主义
- 考陶尔德艺术研究院（Courtauld Institute of Art，伦敦）— 各时期专题
- 斯莱德美术学院（Slade School of Fine Art）— 艺术史笔试

## 🛠️ 技术栈

- **后端**：NestJS + TypeScript
- **数据库**：SQLite（via TypeORM + better-sqlite3）
- **定时任务**：@nestjs/schedule（node-cron）
- **前端**：原生 HTML / CSS / JavaScript（由 NestJS 静态服务）
