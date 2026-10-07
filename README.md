# AI 闯关学习小程序

输入一句话说出你想学什么，AI 自动联网搜索最新资料并生成一组闯关题目，边答边学，每答一题立刻给出答案和讲解，通关后还能拿到一份 AI 复盘报告。

## 一、项目介绍

基于 Taro + Python FastAPI + LangChain + LangGraph + DeepSeek 的 AI 学习类微信小程序，前后端分离。

学知识这件事，最大的敌人不是难，而是枯燥。看文档、看视频，看着看着就走神了，看完还是记不住。而人天生喜欢玩游戏，喜欢闯关、答题、拿奖励。这个项目就是让 AI 把「我想学的任何知识」自动变成一局闯关游戏。

项目的骨架可以直接复用到任何垂直领域，换个知识源就是一个新产品，比如驾考宝典、面试题库、企业内部培训考核、职业资格考试复习、儿童英语单词闯关等等。

### 核心能力

1. **一句话起题**：AI 自动联网搜索并生成闯关题目。大模型的知识有截止日期，所以出题环节接入了 Tavily 联网搜索，用 LangGraph 做成了一个会自己决定搜什么、搜几轮的 ReAct Agent，保证题目不过时。
2. **闯关答题**：支持单选、多选、判断三种题型，每题答完立刻高亮正确答案、标记错误选项，并给出解析和对应的知识点，答错也一样有讲解。
3. **AI 通关复盘报告**：包含掌握度评分、薄弱知识点、三句话知识总结和下一步学习建议，还会结算本局获得的经验值。
4. **输入完全自由**：一句话、一段话、一个网址都可以，AI 会自行判断该怎么补全知识背景。
5. **私有知识库出题（RAG）**：支持 PDF、Word、Markdown、纯文本四种格式，文档会被自动解析、分块、向量化后存入 Chroma 向量库，之后就能基于这篇文档出题，适合企业培训考核、特定题库复习等场景。
6. **AI 题目配图**：调用通义千问文生图模型按知识点生成配图，并转存到腾讯云 COS 获得永久链接，同时做了每日额度和并发控制来管住成本。
7. **微信一键登录**：采用微信静默登录，用户无感授权即可拥有账号。个人中心能看到累计经验值和历史闯关列表，点进任意一条还能回看当时的复盘报告。支持「可选登录」设计，没登录也能完整体验核心流程。

## 二、技术选型

| 层面 | 技术选型 |
| --- | --- |
| 小程序前端 | Taro 4 · React 18 · TypeScript · Sass |
| 后端服务 | Python 3.11+ · FastAPI · Pydantic v2 · Uvicorn · asyncio |
| AI 编排 | LangChain · LangGraph · langchain-openai |
| 大模型 / 检索 | DeepSeek（出题 / 报告）· 阿里云百炼（Embedding / 文生图）· Tavily（联网搜索） |
| 向量检索 | Chroma（RAG 知识库） |
| 数据存储 | MySQL（aiomysql 异步连接池）· 腾讯云 COS（对象存储） |
| 鉴权 | 微信 `jscode2session` 静默登录 + JWT |
| 测试 | pytest · pytest-asyncio |
| 部署 | Docker · 微信云托管 · 云数据库 MySQL |

## 三、快速运行

> 完整步骤请参考 [本地运行指南](./docs/保姆级本地运行指南.md)，里面有每个 API Key 的申请步骤、环境变量逐项说明和常见问题排查。下面是精简版。

### 前置条件

- Python >= 3.11
- Node.js >= 18（推荐 20+）
- MySQL >= 8.0
- 微信开发者工具（[下载地址](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)）
- 一个 [DeepSeek API Key](https://platform.deepseek.com/)（✅ 必需，用于 AI 出题和报告）
- 一个 [Tavily API Key](https://tavily.com/)（🔧 可选，用于联网搜索增强）
- 一个 [阿里云百炼 API Key](https://bailian.console.aliyun.com/)（🔧 可选，用于知识库 RAG 和 AI 生图）
- 一个 [腾讯云 COS](https://console.cloud.tencent.com/cos) 存储桶（🔧 可选，用于存储题目配图）
- 一个 [微信小程序测试号](https://developers.weixin.qq.com/sandbox)（🔧 可选，用于微信登录）

### 1. 启动后端

```bash
cd backend

# 建议使用虚拟环境
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\Activate.ps1

# 安装依赖（国内可加 -i https://pypi.tuna.tsinghua.edu.cn/simple 加速）
pip3 install -r requirements.txt

# 配置环境变量
cp .env.example .env              # 至少填写 DEEPSEEK_API_KEY 和 MYSQL_PASSWORD

# 启动服务（数据表会在启动时自动创建）
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

启动成功后访问 [http://localhost:8000/docs](http://localhost:8000/docs)，能看到 FastAPI 接口文档即为正常。

> 数据库无需手动创建，`MYSQL_AUTO_INIT=true` 时启动会自动建库建 7 张表。也可以手动执行 `python3 scripts/init_mysql.py`。注意不要用 `sql/init_mysql.sql` 建表，该文件缺少 3 张表。

### 2. 启动前端

**新开一个终端**：

```bash
cd frontend
npm install                       # 国内可加 --registry=https://registry.npmmirror.com
npm run dev:weapp                 # 编译到 dist/ 并进入监听模式
```

然后用微信开发者工具新建项目，**目录选择 `frontend/dist`**，AppID 填测试号 AppID。

⚠️ 本地开发必须在开发者工具的「详情」到「本地设置」里 **勾选「不校验合法域名」**，否则请求 `localhost` 会被拦截。真机调试时需将 `frontend/config/dev.ts` 中的 API 地址改为电脑的局域网 IP。

生产构建（自动切换到线上后端地址，需先修改 `frontend/config/prod.ts` 中的域名）：

```bash
npm run build:weapp
```

### 3. 运行测试

```bash
cd backend
pytest
```

测试通过 mock 隔离了大模型和第三方接口调用，不消耗 API 额度。

### 4. 部署

`backend/Dockerfile` 提供了适配 **微信云托管** 的镜像构建文件，也可用于任意支持 Docker 的容器平台。部署所需的密钥类环境变量（数据库密码、各类 API Key、微信 AppSecret、`JWT_SECRET` 等）请通过平台的环境变量功能注入，**不要** 提交到代码仓库。

> 上线还需要完成小程序服务类目申请（AI 类需要「深度合成 - AI 问答」类目及资质材料）、ICP 备案、服务器域名白名单配置和代码审核。

## 四、目录结构

```
├── backend/          # FastAPI 后端
│   ├── app/
│   │   ├── api/      # 路由层
│   │   ├── core/     # 配置、鉴权、数据库、异常
│   │   ├── llm/      # LangChain 编排（出题/报告 Chain）
│   │   ├── models/   # Pydantic 数据模型
│   │   ├── prompts/  # Prompt 模板
│   │   ├── repositories/  # 数据访问层
│   │   └── services/ # 业务服务层（出题/报告/RAG/生图/搜索）
│   ├── sql/          # 建表 SQL（推荐用 scripts/init_mysql.py）
│   └── tests/        # pytest 测试
├── frontend/         # Taro 小程序前端
│   ├── config/       # dev/prod 环境配置
│   └── src/          # 页面、组件、API 封装
├── docs/             # 需求分析、方案设计等文档
└── openspec/         # 规范驱动开发的变更记录
```

## License

MIT
