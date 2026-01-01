import Ajv, { ErrorObject } from "ajv";
import wordPrompt from "./word.v1.json" assert { type: "json" };
import grammarPrompt from "./grammar.is-am-are.v1.json" assert { type: "json" };

export type PromptDefinition = {
  id: string;
  version: string;
  type: string;
  title: string;
  description: string;
  lang_pair: string;
  segment_seconds: number;
  prompt: string;
  output_schema: Record<string, unknown>;
};

export type PromptInstance = PromptDefinition & {
  validateOutput: <T>(payload: T) => T;
};

const ajv = new Ajv({ allErrors: true, strict: false });

const rawPrompts: PromptDefinition[] = [wordPrompt as PromptDefinition, grammarPrompt as PromptDefinition];

const compiled = rawPrompts.map((definition) => {
  const validator = ajv.compile(definition.output_schema);
  return {
    ...definition,
    validateOutput: <T>(payload: T): T => {
      const valid = validator(payload);
      if (!valid) {
        throw new Error(formatAjvError(definition.id, validator.errors));
      }
      return payload;
    },
  } satisfies PromptInstance;
});

const promptMap = new Map<string, PromptInstance>(compiled.map((prompt) => [prompt.id, prompt]));

export function getPrompt(id: string): PromptInstance {
  const prompt = promptMap.get(id);
  if (!prompt) {
    throw new Error(`Prompt ${id} not found`);
  }
  return prompt;
}

export function listPrompts() {
  return Array.from(promptMap.values());
}

function formatAjvError(promptId: string, errors: ErrorObject[] | null | undefined) {
  if (!errors || errors.length === 0) {
    return `Prompt ${promptId} output failed schema validation`;
  }
  return `Prompt ${promptId} output failed schema validation: ${errors.map((err) => `${err.instancePath || "."} ${err.message ?? "invalid"}`).join("; ")}`;
}
