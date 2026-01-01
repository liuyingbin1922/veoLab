import fs from "node:fs";
import path from "node:path";
import { VertexAI } from "@google-cloud/vertexai";

const GOOGLE_PROJECT_ID =
  process.env.GOOGLE_CLOUD_PROJECT ||
  process.env.GCP_PROJECT_ID ||
  process.env.GOOGLE_PROJECT_ID;

const VERTEX_LOCATION =
  process.env.VERTEXAI_LOCATION || process.env.GOOGLE_CLOUD_LOCATION || "us-central1";

const VERTEX_ENDPOINT = process.env.VERTEXAI_API_ENDPOINT;
const INLINE_CREDENTIALS =
  process.env.VERTEXAI_CREDENTIALS_JSON || process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
const SERVICE_ACCOUNT_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS;

let vertexClient: VertexAI | null = null;

export function getVertexClient(): VertexAI {
  if (!GOOGLE_PROJECT_ID) {
    throw new Error("GOOGLE_CLOUD_PROJECT (或 GCP_PROJECT_ID / GOOGLE_PROJECT_ID) 未配置");
  }
  if (!vertexClient) {
    console.log("[vertex] init", {
      project: GOOGLE_PROJECT_ID,
      location: VERTEX_LOCATION,
      hasInlineCreds: Boolean(INLINE_CREDENTIALS),
      hasCredentialPath: Boolean(SERVICE_ACCOUNT_PATH),
      endpoint: VERTEX_ENDPOINT,
    });

    // 根据文档，使用 googleAuthOptions 传递认证信息
    const options: {
      project: string;
      location: string;
      apiEndpoint?: string;
      googleAuthOptions?: {
        credentials?: { client_email?: string; private_key?: string };
        keyFilename?: string;
      };
    } = {
      project: GOOGLE_PROJECT_ID,
      location: VERTEX_LOCATION,
    };

    if (VERTEX_ENDPOINT) {
      options.apiEndpoint = VERTEX_ENDPOINT;
    }

    const inlineCreds = resolveInlineCredentials();
    if (inlineCreds) {
      console.log("[vertex] using inline credentials");
      // 根据文档，通过 googleAuthOptions.credentials 传递内联凭证
      options.googleAuthOptions = {
        credentials: inlineCreds,
      };
      // 在创建 VertexAI 实例之前就删除环境变量，避免 SDK 读取无效路径
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        console.log("[vertex] removing GOOGLE_APPLICATION_CREDENTIALS to use inline credentials");
        delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
      }
    } else if (SERVICE_ACCOUNT_PATH) {
      console.log("[vertex] checking credential file path");
      const resolvedPath = path.isAbsolute(SERVICE_ACCOUNT_PATH)
        ? SERVICE_ACCOUNT_PATH
        : path.join(process.cwd(), SERVICE_ACCOUNT_PATH);
      if (fs.existsSync(resolvedPath)) {
        // 如果文件存在，使用 keyFilename
        options.googleAuthOptions = {
          keyFilename: resolvedPath,
        };
        console.log("[vertex] using credential file:", resolvedPath);
      } else {
        console.warn(
          `[vertex-ai] GOOGLE_APPLICATION_CREDENTIALS 指向的文件不存在：${resolvedPath}，将回退到默认凭证（ADC）。`
        );
        // 文件不存在时，删除环境变量，让 SDK 使用默认凭证
        delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
      }
    } else {
      console.log("[vertex] using default credentials (ADC)");
      // 如果没有提供凭证，SDK 会自动使用 Application Default Credentials (ADC)
      // 这需要运行 gcloud auth application-default login
    }

    vertexClient = new VertexAI(options);
  }
  return vertexClient;
}

export function getGenerativeModel(model: string) {
  return getVertexClient().getGenerativeModel({ model });
}

function resolveInlineCredentials():
  | {
      client_email?: string;
      private_key?: string;
    }
  | undefined {
  if (!INLINE_CREDENTIALS) return undefined;
  const normalized = sanitizeInlineJSON(INLINE_CREDENTIALS);
  try {
    const parsed = JSON.parse(normalized);
    if (parsed && typeof parsed === "object" && typeof parsed.private_key === "string") {
      parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
    }
    return parsed;
  } catch (error) {
    throw new Error("VERTEXAI_CREDENTIALS_JSON/GOOGLE_APPLICATION_CREDENTIALS_JSON 不是合法 JSON");
  }
}

function sanitizeInlineJSON(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  const startsWithQuote = trimmed.startsWith("'") || trimmed.startsWith('"');
  const endsWithSameQuote =
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'));
  if (startsWithQuote && endsWithSameQuote) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}
