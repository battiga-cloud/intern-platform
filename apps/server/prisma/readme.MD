为了确保团队协作和线上数据的绝对安全，我们将流程分为 **“本地开发测试”** 和 **“线上生产部署”** 两条线。

以下是基于目前 `package.json` 设定的标准操作流程（SOP）：

### 💻 一、 本地开发测试流程 (Local Environment)

在本地，你的核心目标是**修改表结构、生成迁移脚本，并进行接口联调**。

**Step 1: 启动本地数据库**
如果你本地没有安装 PostgreSQL，可以使用 Docker 快速启动一个：
```bash
# 在 server 目录下执行，启动本地开发用的 DB 容器
pnpm --filter server run docker:db
```

**Step 2: 修改 Schema 并生成迁移脚本 (核心)**
当你在 `schema.prisma` 中新增了表或修改了字段后：
```bash
# 生成并应用迁移记录 (注意 --name 后面跟英文描述)
pnpm --filter server run db:migrate -- --name add_some_tables
```
*💡 这一步会自动帮你执行 `db:generate` 刷新 TypeScript 类型。*

**Step 3: 启动服务进行本地测试**
```bash
# 启动 NestJS 本地服务 (带热更新)
pnpm --filter server run start:dev
```

**Step 4: 提交代码**
测试无误后，将代码连同 `prisma/migrations` 文件夹里的所有 SQL 脚本一起提交到 Git。
*⚠️ 必须提交 `migrations` 文件夹，这是线上的升级依据。*

---

### 🚀 二、 线上生产部署流程 (Production Environment)

在线上，你的核心目标是**平滑升级表结构（不丢失数据）并启动服务**。线上环境**严禁**使用 `db:migrate` 或 `db:push`。

**Step 1: 拉取最新代码并安装依赖**
在服务器上拉取包含最新 `migrations` 文件夹的 Git 代码。
```bash
git pull origin main
pnpm install
```

**Step 2: 构建生产环境代码**
```bash
pnpm --filter server run build
```

**Step 3: 执行线上数据库升级与启动 (核心)**
我们之前在 `package.json` 中配置了一个一键启动脚本 `start:db`，它非常适合用在线上环境的初始化或升级：
```bash
# 这个指令会依次执行：
# 1. db:deploy (安全地把新 SQL 脚本在生产库执行一遍)
# 2. db:generate (生成生产环境的 Prisma Client)
# 3. db:seed (如果有初始化的种子数据，比如超级管理员账号，会在这里注入)
pnpm --filter server run start:db
```
*(注意：如果你的线上库已经有数据了，确保你的 `seed` 脚本里有防重逻辑，或者你也可以单独执行 `pnpm --filter server run db:deploy` 和 `db:generate`)*

**Step 4: 启动 Node.js 进程**
使用 PM2 或 Node 直接启动编译后的代码：
```bash
pnpm --filter server run start:prod
# 或者 pm2 start dist/main.js --name "intern-server"
```

---

### 🐳 三、 (可选) 基于 Docker 的全容器化线上部署

如果你的线上环境完全依赖 Docker Compose（从你的指令中看，你有相关的 YAML 文件）：

**Step 1: 构建并启动业务容器**
```bash
# 重新构建镜像并后台启动
pnpm --filter server run docker:build
pnpm --filter server run docker
```

**Step 2: 在容器内执行增量迁移**
服务启动后，执行配置好的 docker 迁移指令：
```bash
# 这会触发 docker-compose.migrate.yml，在容器网络内执行 db:deploy
pnpm --filter server run docker:migrate
```

### 📋 常用指令速查表

| 场景 | 指令 | 作用说明 |
| :--- | :--- | :--- |
| **本地：改了表结构** | `run db:migrate -- --name xxx` | 生成迁移 SQL，应用到本地库，更新 TS 类型 |
| **本地：只想刷新类型** | `run db:generate` | 不动数据库，仅根据当前 Schema 更新代码提示 |
| **本地：查看数据库数据**| `run db:studio` | 开启一个本地网页 (localhost:5555) 管理数据 |
| **线上：数据库平滑升级**| `run db:deploy` | 根据 `migrations` 的 SQL 安全升级线上表结构 |
| **线上：初始化/升级一条龙**| `run start:db` | 包含部署升级、Client生成、种子数据灌入 |
