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
    const options: {
      project: string;
      location: string;
      apiEndpoint?: string;
      credentials?: { client_email?: string; private_key?: string };
    } = {
      project: GOOGLE_PROJECT_ID,
      location: VERTEX_LOCATION,
    };
    if (VERTEX_ENDPOINT) {
      options.apiEndpoint = VERTEX_ENDPOINT;
    }
    const inlineCreds = resolveInlineCredentials();
    if (inlineCreds) {
      options.credentials = inlineCreds;
    } else {
      sanitizeMissingCredentialPath();
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

function sanitizeMissingCredentialPath() {
  if (!SERVICE_ACCOUNT_PATH) return;
  try {
    const resolvedPath = path.isAbsolute(SERVICE_ACCOUNT_PATH)
      ? SERVICE_ACCOUNT_PATH
      : path.join(process.cwd(), SERVICE_ACCOUNT_PATH);
    if (!fs.existsSync(resolvedPath)) {
      console.warn(
        `[vertex-ai] GOOGLE_APPLICATION_CREDENTIALS 指向的文件不存在：${resolvedPath}，将回退到默认凭证（ADC）。`
      );
      delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    }
  } catch {
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
  }
}
