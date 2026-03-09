# Art History Learning System

个人艺术史学习与管理系统。基于 **Next.js 15 App Router + TypeScript + Tailwind CSS + Supabase** 构建，可一键部署到 Vercel。

---

## 系统模块划分

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

---

## 推荐目录结构

```
art-history/
├── app/
│   ├── (auth)/login/page.tsx           # 登录页
│   ├── (auth)/register/page.tsx        # 注册页
│   ├── (main)/
│   │   ├── layout.tsx                  # 主布局（侧边栏）
│   │   ├── dashboard/page.tsx          # 仪表盘
│   │   ├── artists/                    # 艺术家列表、详情、新增、编辑
│   │   ├── artworks/                   # 作品列表、详情、新增、编辑
│   │   ├── periods/                    # 时期列表、新增
│   │   ├── tags/                       # 标签列表、新增
│   │   ├── notes/                      # 笔记列表、详情/编辑、新增
│   │   ├── favorites/                  # 收藏夹
│   │   ├── search/                     # 全局搜索
│   │   └── notion-articles/            # Notion 文章列表、详情
│   ├── api/
│   │   ├── notion-sync/route.ts        # POST /api/notion-sync
│   │   └── upload/route.ts             # POST /api/upload
│   ├── layout.tsx
│   └── page.tsx                        # 重定向到 /dashboard
├── actions/                            # Server Actions
│   ├── auth.ts
│   ├── artists.ts
│   ├── artworks.ts
│   ├── periods.ts
│   ├── tags.ts
│   ├── notes.ts
│   └── favorites.ts
├── components/
│   ├── layout/Sidebar.tsx
│   ├── layout/PageHeader.tsx
│   ├── ui/TagBadge.tsx
│   ├── ui/EmptyState.tsx
│   ├── ui/ImageUpload.tsx
│   ├── ui/SearchBar.tsx
│   ├── ui/FavoriteButton.tsx
│   ├── artists/ArtistCard.tsx
│   ├── artists/ArtistForm.tsx
│   ├── artworks/ArtworkCard.tsx
│   ├── artworks/ArtworkForm.tsx
│   └── notes/NoteCard.tsx
├── lib/
│   ├── supabase/client.ts              # 浏览器端客户端
│   ├── supabase/server.ts              # 服务器端客户端
│   ├── supabase/middleware.ts          # 会话刷新
│   └── notion.ts                       # Notion API 工具
├── types/
│   ├── database.ts                     # Supabase 表类型
│   └── index.ts                        # 应用层类型
├── supabase/migrations/
│   └── 20240101000000_initial_schema.sql
├── middleware.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── .env.example
```

---

## 数据库实体设计

```
profiles        → user_id (FK auth.users)
periods         → name, start_year, end_year, description
artists         → name, nationality, bio, birth/death_year, period_id, image_url
artworks        → title, artist_id, year, medium, dimensions, description, image_url, period_id
tags            → name, color
artwork_tags    → artwork_id × tag_id
artist_tags     → artist_id × tag_id
notes           → user_id, title, content, entity_type, entity_id
favorites       → user_id, entity_type, entity_id
notion_articles → notion_page_id, title, content, cover_url, tags[], synced_at
```

全部表均启用 **Row Level Security**。

---

## 页面清单

| 路径 | 说明 |
|------|------|
| `/login` | 登录 |
| `/register` | 注册 |
| `/dashboard` | 仪表盘（统计概览 + 快捷入口） |
| `/artists` | 艺术家列表（搜索 + 时期筛选） |
| `/artists/new` | 新增艺术家 |
| `/artists/[id]` | 艺术家详情 |
| `/artists/[id]/edit` | 编辑艺术家 |
| `/artworks` | 作品列表（搜索 + 多维筛选） |
| `/artworks/new` | 新增作品 |
| `/artworks/[id]` | 作品详情 |
| `/artworks/[id]/edit` | 编辑作品 |
| `/periods` | 时期列表 |
| `/periods/new` | 新增时期 |
| `/tags` | 标签列表 |
| `/tags/new` | 新增标签 |
| `/notes` | 笔记列表（搜索） |
| `/notes/new` | 新建笔记 |
| `/notes/[id]` | 笔记详情 / 编辑 |
| `/favorites` | 收藏夹 |
| `/search` | 全局搜索 |
| `/notion-articles` | Notion 文章列表 |
| `/notion-articles/[id]` | 文章详情 |

---

## API / Server Actions 清单

### Route Handlers

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/upload` | POST | 上传图片到 Supabase Storage |
| `/api/notion-sync` | POST | 从 Notion 同步文章 |

### Server Actions (`actions/`)

| 文件 | 函数 |
|------|------|
| `auth.ts` | `loginAction`, `registerAction`, `logoutAction` |
| `artists.ts` | `createArtist`, `updateArtist`, `deleteArtist` |
| `artworks.ts` | `createArtwork`, `updateArtwork`, `deleteArtwork` |
| `periods.ts` | `createPeriod`, `updatePeriod`, `deletePeriod` |
| `tags.ts` | `createTag`, `updateTag`, `deleteTag` |
| `notes.ts` | `createNote`, `updateNote`, `deleteNote` |
| `favorites.ts` | `toggleFavorite` |

---

## 实现顺序（推荐）

1. **环境搭建** – 创建 Supabase 项目，执行 SQL migration，配置 `.env.local`
2. **认证流程** – 登录 / 注册 / 登出，`middleware.ts` 保护路由
3. **核心 CRUD** – Periods → Tags → Artists → Artworks（依赖关系从简到复杂）
4. **图片上传** – `POST /api/upload` + `ImageUpload` 组件
5. **笔记 & 收藏** – Notes、Favorites
6. **搜索** – 全局搜索页
7. **Notion 同步** – `POST /api/notion-sync`，配置定时任务或手动触发
8. **部署** – Vercel 部署，配置环境变量

---

## 快速开始

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

---

## 环境变量

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NOTION_API_KEY=secret_your_notion_integration_token
NOTION_ARTICLES_DATABASE_ID=your-notion-database-id
NOTION_SYNC_SECRET=your-random-secret
```

---

## 部署说明

推荐部署到 Vercel。

该项目使用了 Next.js App Router 的动态服务端能力，包括：

- `middleware`
- Server Actions
- `app/api` Route Handlers
- Supabase 服务端会话

因此不适合部署到 GitHub Pages 这类纯静态托管平台。GitHub Actions 中保留的是构建校验，不再执行 GitHub Pages 发布。

---

## Notion 同步

触发同步（使用 NOTION_SYNC_SECRET 作为 Bearer token）：

```bash
curl -X POST https://your-app.vercel.app/api/notion-sync \
  -H "Authorization: Bearer YOUR_NOTION_SYNC_SECRET"
```

也可以通过 Vercel Cron Jobs 定期触发。
