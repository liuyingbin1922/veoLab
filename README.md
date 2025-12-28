# 分镜视频工厂（Next.js + Gemini）

一个 ToC 运营分镜生成工具：输入选题参数，一键产出爆款标题、旁白脚本、分镜表和逐镜头的 Veo 3 prompt，并支持 Markdown / CSV 导出。

## 功能
- 表单输入：平台 / 时长 / 模板 / 人设 / 必须出现 / 禁忌
- 服务端 `/api/generate` 使用 Gemini 双阶段生成标题/旁白与分镜 JSON
- Zod 校验 + shot 数量/时长约束校正
- 7 天内存缓存（同参数命中直接返回）
- IP 级限流（默认每天 3 次，可通过 `RATE_LIMIT_PER_IP` 调整）
- 前端结果展示、复制按钮、Markdown/CSV 下载

## 开发
1. 安装依赖（如网络受限请配置代理或私有 npm 源）：
   ```bash
   pnpm install
   ```
2. 运行开发服务：
   ```bash
   pnpm dev
   ```

## 环境变量
在项目根目录创建 `.env.local`：
```
GOOGLE_CLOUD_PROJECT=your_gcp_project_id
VERTEXAI_LOCATION=us-central1                      # 可选，默认 us-central1
VERTEXAI_API_ENDPOINT=us-central1-aiplatform.googleapis.com  # 可选，自定义 Vertex 入口
GOOGLE_APPLICATION_CREDENTIALS=/abs/path/service-account.json # 可选，服务账号路径
VERTEXAI_CREDENTIALS_JSON='{"client_email":"...","private_key":"..."}' # 可选，或使用 JSON 字符串
GEMINI_TEXT_MODEL=gemini-1.5-pro                   # 可选，文案阶段模型
GEMINI_MODEL=gemini-1.5-pro                        # 可选，分镜阶段模型
RATE_LIMIT_PER_IP=3                                # 可选，默认 3
```

## 路由
- `/`：表单 + 结果页
- `POST /api/generate`：生成接口（含缓存、限流、重试）

## 数据结构
`lib/schema.ts` 定义请求与 `StoryboardResult` 响应 schema（含镜头数量/时长校验）。

## 导出
- Markdown：包含标题、旁白、分镜表、Veo prompts
- CSV：shot/秒数/画面/镜头语言/字幕/BGM-SFX/Veo prompt/Negative prompt

## 注意
- 生产环境建议将缓存与限流迁移至 Redis/KV。
- 模型输出若未满足 JSON 规范，会在服务端自动重试一次。
