import get from "lodash.get";
import type { TextGeneratorSettings } from "#/types";
import { TG_SETTINGS_META } from "./config-metadata";
import { coerceNumberToMeta } from "./config-meta-utils";

export function getSelectedModelId(settings: TextGeneratorSettings) {
  const id = settings.selectedProvider as any;
  return settings.LLMProviderOptions?.[id]?.model as string | undefined;
}

function isGpt5FamilyOrChatLatest(modelId: string | undefined) {
  if (!modelId) return false;
  const m = modelId.toLowerCase();
  return m.startsWith("gpt-5") || m === "chat-latest";
}

export function buildRequestBodyFromParams(args: {
  params: any;
  providerOriginalId?: string;
  modelId?: string;
}) {
  const { params } = args;
  const providerOriginalId = args.providerOriginalId;
  const modelId = args.modelId ?? (params?.model as string | undefined);

  const body: Record<string, any> = {};
  if (modelId) body.model = modelId;

  for (const meta of Object.values(TG_SETTINGS_META)) {
    if (!meta.requestBody?.enabled) continue;

    const value = get(params as any, meta.key);
    if (value == null) continue;

    const paramName = meta.requestBody.paramName ?? meta.key.split(".").at(-1)!;

    if (meta.type === "number") {
      const coerced = coerceNumberToMeta(value, meta as any);
      body[paramName] = coerced.value;
      continue;
    }

    body[paramName] = value;
  }

  if (providerOriginalId === "OpenAI Chat (Langchain)" && isGpt5FamilyOrChatLatest(modelId)) {
    const maxTokensMeta = (TG_SETTINGS_META as any).max_tokens;
    const coerced = coerceNumberToMeta(params?.max_tokens, maxTokensMeta);
    body.max_completion_tokens = Math.max(1, coerced.value);
    delete body.max_tokens;

    delete body.frequency_penalty;
    delete body.presence_penalty;
  }

  return body;
}

/**
 * Builds a best-effort request body preview from plugin settings + provider context.
 * This is intentionally conservative: it only includes fields flagged as requestBody-enabled.
 */
export function buildRequestBodyPreview(args: {
  settings: TextGeneratorSettings;
  providerOriginalId?: string;
  modelId?: string;
}) {
  const { settings } = args;
  const providerOriginalId = args.providerOriginalId;
  const modelId = args.modelId ?? getSelectedModelId(settings);
  return buildRequestBodyFromParams({
    params: { ...settings, model: modelId },
    providerOriginalId,
    modelId,
  });
}
