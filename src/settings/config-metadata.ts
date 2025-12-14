import DEFAULT_SETTINGS from "#/default-settings";
import get from "lodash.get";
import type { TextGeneratorSettings } from "#/types";

export type RecommendedRange = { min: number; max: number } | null;

export type TGSettingsSectionId =
  | "model-endpoint"
  | "generation"
  | "streaming-performance"
  | "advanced-expert";

export type TGSettingValueType =
  | "number"
  | "boolean"
  | "string"
  | "textarea"
  | "custom";

export type TGSettingMeta<T = any> = {
  key: string;
  type: TGSettingValueType;
  min: number | null;
  max: number | null;
  step: number | null;
  default: T;
  recommendedRange: RecommendedRange;
  description: string;
  label: string;
  section: TGSettingsSectionId;
  subsection?: string;

  /**
   * When true, the value is eligible for inclusion in request body shaping (e.g. max_tokens).
   * The request parameter name defaults to the last segment of the key unless overridden.
   */
  requestBody?: { enabled: boolean; paramName?: string };

  /** Slider UX */
  slider?: { allowDirectEntry?: boolean; unit?: string };
};

const d = <T>(key: string) => get(DEFAULT_SETTINGS as any, key) as T;

/**
 * Centralized configuration metadata for adjustable settings.
 * Keys use lodash-style dot paths (e.g. "autoSuggestOptions.delay", "options.generate-text").
 */
const BASE_META = {
  // ----- Model & Endpoint (mostly custom-rendered, but still metadata-tracked) -----
  selectedProvider: {
    key: "selectedProvider",
    type: "custom",
    min: null,
    max: null,
    step: null,
    default: d<TextGeneratorSettings["selectedProvider"]>("selectedProvider"),
    recommendedRange: null,
    description: "Select and configure the active provider profile.",
    label: "Provider Profile",
    section: "model-endpoint",
  },

  endpoint: {
    key: "endpoint",
    type: "string",
    min: null,
    max: null,
    step: null,
    default: d<string>("endpoint"),
    recommendedRange: null,
    description: "Base API endpoint (most providers override this per profile).",
    label: "Endpoint",
    section: "model-endpoint",
  },

  // ----- Generation Controls -----
  max_tokens: {
    key: "max_tokens",
    type: "number",
    min: 1,
    max: 200000,
    step: 1,
    default: d<number>("max_tokens"),
    recommendedRange: { min: 256, max: 8192 },
    description:
      "Maximum tokens to generate. Input + output must fit the model context window.",
    label: "Max Tokens",
    section: "generation",
    requestBody: { enabled: true, paramName: "max_tokens" },
    slider: { allowDirectEntry: true, unit: "tokens" },
  },
  temperature: {
    key: "temperature",
    type: "number",
    min: 0,
    max: 2,
    step: 0.01,
    default: d<number>("temperature"),
    recommendedRange: { min: 0.1, max: 1.2 },
    description: "Sampling temperature. Higher = more random; lower = more deterministic.",
    label: "Temperature",
    section: "generation",
    requestBody: { enabled: true, paramName: "temperature" },
    slider: { allowDirectEntry: true },
  },
  frequency_penalty: {
    key: "frequency_penalty",
    type: "number",
    min: -2,
    max: 2,
    step: 0.01,
    default: d<number>("frequency_penalty"),
    recommendedRange: { min: -0.5, max: 1.0 },
    description:
      "Penalizes tokens that already appear, encouraging new topics (model-dependent).",
    label: "Frequency Penalty",
    section: "generation",
    requestBody: { enabled: true, paramName: "frequency_penalty" },
    slider: { allowDirectEntry: true },
  },
  prefix: {
    key: "prefix",
    type: "string",
    min: null,
    max: null,
    step: null,
    default: d<string>("prefix"),
    recommendedRange: null,
    description: "Text prepended before inserting generated content.",
    label: "Prefix",
    section: "generation",
    subsection: "Output",
  },

  // ----- Streaming & Performance -----
  stream: {
    key: "stream",
    type: "boolean",
    min: 0,
    max: 1,
    step: 1,
    default: d<boolean>("stream"),
    recommendedRange: null,
    description: "Enable streaming when supported by the provider.",
    label: "Streaming",
    section: "streaming-performance",
    subsection: "Streaming",
  },
  requestTimeout: {
    key: "requestTimeout",
    type: "number",
    min: 1000,
    max: 900000,
    step: 1000,
    default: d<number>("requestTimeout"),
    recommendedRange: { min: 15000, max: 300000 },
    description: "Abort requests that exceed this duration.",
    label: "Request Timeout",
    section: "streaming-performance",
    slider: { allowDirectEntry: true, unit: "ms" },
    subsection: "Performance",
  },
  freeCursorOnStreaming: {
    key: "freeCursorOnStreaming",
    type: "boolean",
    min: 0,
    max: 1,
    step: 1,
    default: d<boolean>("freeCursorOnStreaming"),
    recommendedRange: null,
    description: "Allow editing while streaming (may cause cursor/scroll quirks).",
    label: "Free Cursor While Streaming",
    section: "streaming-performance",
    subsection: "Streaming",
  },
  showStatusBar: {
    key: "showStatusBar",
    type: "boolean",
    min: 0,
    max: 1,
    step: 1,
    default: d<boolean>("showStatusBar"),
    recommendedRange: null,
    description: "Show generation status and quick actions in the status bar.",
    label: "Show Status Bar",
    section: "streaming-performance",
    subsection: "UI",
  },

  // ----- Auto-suggest -----
  "autoSuggestOptions.isEnabled": {
    key: "autoSuggestOptions.isEnabled",
    type: "boolean",
    min: 0,
    max: 1,
    step: 1,
    default: d<boolean>("autoSuggestOptions.isEnabled"),
    recommendedRange: null,
    description: "Enable inline auto-suggestions.",
    label: "Auto-Suggest",
    section: "streaming-performance",
    subsection: "Auto-Suggest",
  },
  "autoSuggestOptions.inlineSuggestions": {
    key: "autoSuggestOptions.inlineSuggestions",
    type: "boolean",
    min: 0,
    max: 1,
    step: 1,
    default: d<boolean>("autoSuggestOptions.inlineSuggestions"),
    recommendedRange: null,
    description: "Render suggestions inline in the editor (experimental).",
    label: "Inline Suggestions",
    section: "streaming-performance",
    subsection: "Auto-Suggest",
  },
  "autoSuggestOptions.showInMarkdown": {
    key: "autoSuggestOptions.showInMarkdown",
    type: "boolean",
    min: 0,
    max: 1,
    step: 1,
    default: d<boolean>("autoSuggestOptions.showInMarkdown"),
    recommendedRange: null,
    description:
      "Render inline suggestions as markdown (may add extra spacing; experimental).",
    label: "Show In Markdown",
    section: "streaming-performance",
    subsection: "Auto-Suggest",
  },
  "autoSuggestOptions.triggerPhrase": {
    key: "autoSuggestOptions.triggerPhrase",
    type: "string",
    min: null,
    max: null,
    step: null,
    default: d<string>("autoSuggestOptions.triggerPhrase"),
    recommendedRange: null,
    description: "Text that triggers auto-suggest (default: double space).",
    label: "Trigger Phrase",
    section: "streaming-performance",
    subsection: "Auto-Suggest",
  },
  "autoSuggestOptions.overrideTrigger": {
    key: "autoSuggestOptions.overrideTrigger",
    type: "string",
    min: null,
    max: null,
    step: null,
    default: d<string>("autoSuggestOptions.overrideTrigger"),
    recommendedRange: null,
    description:
      "Replacement text inserted when a suggestion is accepted (default: single space).",
    label: "Override Trigger",
    section: "streaming-performance",
    subsection: "Auto-Suggest",
  },
  "autoSuggestOptions.delay": {
    key: "autoSuggestOptions.delay",
    type: "number",
    min: 0,
    max: 2000,
    step: 25,
    default: d<number>("autoSuggestOptions.delay"),
    recommendedRange: { min: 150, max: 600 },
    description: "Delay after trigger before requesting suggestions.",
    label: "Auto-Suggest Delay",
    section: "streaming-performance",
    slider: { allowDirectEntry: true, unit: "ms" },
    subsection: "Auto-Suggest",
  },
  "autoSuggestOptions.numberOfSuggestions": {
    key: "autoSuggestOptions.numberOfSuggestions",
    type: "number",
    min: 1,
    max: 20,
    step: 1,
    default: d<number>("autoSuggestOptions.numberOfSuggestions"),
    recommendedRange: { min: 1, max: 5 },
    description: "How many suggestions to request per trigger.",
    label: "Suggestions Per Trigger",
    section: "streaming-performance",
    slider: { allowDirectEntry: true },
    subsection: "Auto-Suggest",
  },
  "autoSuggestOptions.stop": {
    key: "autoSuggestOptions.stop",
    type: "string",
    min: null,
    max: null,
    step: null,
    default: d<string>("autoSuggestOptions.stop"),
    recommendedRange: null,
    description: "Stop sequence for suggestions (e.g. '.' or '\\n').",
    label: "Stop Phrase",
    section: "streaming-performance",
    subsection: "Auto-Suggest",
  },
  "autoSuggestOptions.allowInNewLine": {
    key: "autoSuggestOptions.allowInNewLine",
    type: "boolean",
    min: 0,
    max: 1,
    step: 1,
    default: d<boolean>("autoSuggestOptions.allowInNewLine"),
    recommendedRange: null,
    description: "Allow triggering suggestions at the start of a new line.",
    label: "Allow In New Line",
    section: "streaming-performance",
    subsection: "Auto-Suggest",
  },
  "autoSuggestOptions.showStatus": {
    key: "autoSuggestOptions.showStatus",
    type: "boolean",
    min: 0,
    max: 1,
    step: 1,
    default: d<boolean>("autoSuggestOptions.showStatus"),
    recommendedRange: null,
    description: "Show auto-suggest status in the status bar.",
    label: "Show Status",
    section: "streaming-performance",
    subsection: "Auto-Suggest",
  },
  "autoSuggestOptions.customInstructEnabled": {
    key: "autoSuggestOptions.customInstructEnabled",
    type: "boolean",
    min: 0,
    max: 1,
    step: 1,
    default: d<boolean>("autoSuggestOptions.customInstructEnabled"),
    recommendedRange: null,
    description: "Use a custom prompt for auto-suggest.",
    label: "Custom Prompt",
    section: "streaming-performance",
    subsection: "Auto-Suggest Prompting",
  },
  "autoSuggestOptions.customInstruct": {
    key: "autoSuggestOptions.customInstruct",
    type: "textarea",
    min: null,
    max: null,
    step: null,
    default: d<string>("autoSuggestOptions.customInstruct"),
    recommendedRange: null,
    description: "Template used to generate suggestions.",
    label: "Auto-Suggest Prompt",
    section: "streaming-performance",
    subsection: "Auto-Suggest Prompting",
  },
  "autoSuggestOptions.systemPrompt": {
    key: "autoSuggestOptions.systemPrompt",
    type: "textarea",
    min: null,
    max: null,
    step: null,
    default: d<string>("autoSuggestOptions.systemPrompt"),
    recommendedRange: null,
    description: "Optional system prompt for auto-suggest.",
    label: "Auto-Suggest System Prompt",
    section: "streaming-performance",
    subsection: "Auto-Suggest Prompting",
  },
  "autoSuggestOptions.customProvider": {
    key: "autoSuggestOptions.customProvider",
    type: "boolean",
    min: 0,
    max: 1,
    step: 1,
    default: d<boolean>("autoSuggestOptions.customProvider"),
    recommendedRange: null,
    description: "Use a different provider profile for auto-suggest.",
    label: "Custom Provider",
    section: "streaming-performance",
    subsection: "Auto-Suggest Provider",
  },
  "autoSuggestOptions.selectedProvider": {
    key: "autoSuggestOptions.selectedProvider",
    type: "custom",
    min: null,
    max: null,
    step: null,
    default: d<string | undefined>("autoSuggestOptions.selectedProvider"),
    recommendedRange: null,
    description: "Provider profile used for auto-suggest when enabled.",
    label: "Auto-Suggest Provider Profile",
    section: "streaming-performance",
    subsection: "Auto-Suggest Provider",
  },

  // ----- Slash suggest -----
  "slashSuggestOptions.isEnabled": {
    key: "slashSuggestOptions.isEnabled",
    type: "boolean",
    min: 0,
    max: 1,
    step: 1,
    default: d<boolean>("slashSuggestOptions.isEnabled"),
    recommendedRange: null,
    description: "Enable slash-triggered suggestion modal.",
    label: "Slash Suggest",
    section: "streaming-performance",
    subsection: "Slash Suggest",
  },
  "slashSuggestOptions.triggerPhrase": {
    key: "slashSuggestOptions.triggerPhrase",
    type: "string",
    min: null,
    max: null,
    step: null,
    default: d<string>("slashSuggestOptions.triggerPhrase"),
    recommendedRange: null,
    description: "Trigger character for slash suggest.",
    label: "Trigger Phrase",
    section: "streaming-performance",
    subsection: "Slash Suggest",
  },

  // ----- Advanced / Expert (selected high-impact toggles) -----
  displayErrorInEditor: {
    key: "displayErrorInEditor",
    type: "boolean",
    min: 0,
    max: 1,
    step: 1,
    default: d<boolean>("displayErrorInEditor"),
    recommendedRange: null,
    description: "Show request errors inline in the editor.",
    label: "Display Errors In Editor",
    section: "advanced-expert",
    subsection: "Debugging",
  },
  outputToBlockQuote: {
    key: "outputToBlockQuote",
    type: "boolean",
    min: 0,
    max: 1,
    step: 1,
    default: d<boolean>("outputToBlockQuote"),
    recommendedRange: null,
    description: "Wrap generated text in a blockquote for visual separation.",
    label: "Output As Blockquote",
    section: "advanced-expert",
    subsection: "Output",
  },
  experiment: {
    key: "experiment",
    type: "boolean",
    min: 0,
    max: 1,
    step: 1,
    default: d<boolean>("experiment"),
    recommendedRange: null,
    description: "Enable experimental features (may be unstable).",
    label: "Experimental Features",
    section: "advanced-expert",
    subsection: "Experimental",
  },
  encrypt_keys: {
    key: "encrypt_keys",
    type: "boolean",
    min: 0,
    max: 1,
    step: 1,
    default: d<boolean>("encrypt_keys"),
    recommendedRange: null,
    description:
      "Encrypt stored keys (may be incompatible with some mobile setups).",
    label: "Key Encryption",
    section: "advanced-expert",
    subsection: "Security",
  },
  allowJavascriptRun: {
    key: "allowJavascriptRun",
    type: "boolean",
    min: 0,
    max: 1,
    step: 1,
    default: d<boolean>("allowJavascriptRun"),
    recommendedRange: null,
    description: "Allow templates to execute JavaScript (dangerous).",
    label: "Allow JavaScript Execution",
    section: "advanced-expert",
    subsection: "Security",
  },
  "advancedOptions.includeAttachmentsInRequest": {
    key: "advancedOptions.includeAttachmentsInRequest",
    type: "boolean",
    min: 0,
    max: 1,
    step: 1,
    default: d<boolean>("advancedOptions.includeAttachmentsInRequest"),
    recommendedRange: null,
    description:
      "Include referenced image content in requests (can consume many tokens).",
    label: "Include Attachments In Requests",
    section: "advanced-expert",
    subsection: "Context",
  },
  "context.customInstructEnabled": {
    key: "context.customInstructEnabled",
    type: "boolean",
    min: 0,
    max: 1,
    step: 1,
    default: d<boolean>("context.customInstructEnabled"),
    recommendedRange: null,
    description: "Customize the default {{context}} variable prompt.",
    label: "Custom Default Generation Prompt",
    section: "advanced-expert",
    subsection: "Prompting",
  },
  "context.customInstruct": {
    key: "context.customInstruct",
    type: "textarea",
    min: null,
    max: null,
    step: null,
    default: d<string>("context.customInstruct"),
    recommendedRange: null,
    description: "Template used for {{context}} when custom prompt is enabled.",
    label: "Custom {{context}} Prompt",
    section: "advanced-expert",
    subsection: "Prompting",
  },
  "context.contextTemplate": {
    key: "context.contextTemplate",
    type: "textarea",
    min: null,
    max: null,
    step: null,
    default: d<string>("context.contextTemplate"),
    recommendedRange: null,
    description: "Template for {{context}} variable in templates.",
    label: "{{context}} Variable Template",
    section: "advanced-expert",
    subsection: "Templates",
  },
  "context.includeClipboard": {
    key: "context.includeClipboard",
    type: "boolean",
    min: 0,
    max: 1,
    step: 1,
    default: d<boolean>("context.includeClipboard"),
    recommendedRange: null,
    description: "Make clipboard available to templates.",
    label: "Include Clipboard",
    section: "advanced-expert",
    subsection: "Templates",
  },
  "advancedOptions.generateTitleInstructEnabled": {
    key: "advancedOptions.generateTitleInstructEnabled",
    type: "boolean",
    min: 0,
    max: 1,
    step: 1,
    default: d<boolean>("advancedOptions.generateTitleInstructEnabled"),
    recommendedRange: null,
    description: "Enable custom prompt for generating titles.",
    label: "Custom Title Prompt",
    section: "advanced-expert",
    subsection: "Prompting",
  },
  "advancedOptions.generateTitleInstruct": {
    key: "advancedOptions.generateTitleInstruct",
    type: "textarea",
    min: null,
    max: null,
    step: null,
    default: d<string>("advancedOptions.generateTitleInstruct"),
    recommendedRange: null,
    description: "Prompt template used to generate titles.",
    label: "Generate Title Prompt",
    section: "advanced-expert",
    subsection: "Prompting",
  },
  tgSelectionLimiter: {
    key: "tgSelectionLimiter",
    type: "string",
    min: null,
    max: null,
    step: null,
    default: d<string>("tgSelectionLimiter"),
    recommendedRange: null,
    description: "Regex marking where {{tg_selection}} should stop (empty disables).",
    label: "TG Selection Limiter (regex)",
    section: "advanced-expert",
    subsection: "Templates",
  },
  promptsPath: {
    key: "promptsPath",
    type: "string",
    min: null,
    max: null,
    step: null,
    default: d<string>("promptsPath"),
    recommendedRange: null,
    description: "Templates directory path.",
    label: "Templates Path",
    section: "advanced-expert",
    subsection: "Paths",
  },
  textGenPath: {
    key: "textGenPath",
    type: "string",
    min: null,
    max: null,
    step: null,
    default: d<string>("textGenPath"),
    recommendedRange: null,
    description: "Output directory for generated content and backups.",
    label: "Text Generator Path",
    section: "advanced-expert",
    subsection: "Paths",
  },
} satisfies Record<string, TGSettingMeta<any>>;

const booleanMeta = (props: {
  key: string;
  label: string;
  description: string;
  section: TGSettingsSectionId;
  subsection?: string;
}) =>
  ({
    key: props.key,
    type: "boolean",
    min: 0,
    max: 1,
    step: 1,
    default: d<boolean>(props.key),
    recommendedRange: null,
    description: props.description,
    label: props.label,
    section: props.section,
    subsection: props.subsection,
  }) satisfies TGSettingMeta<boolean>;

const OPTIONS_META = Object.fromEntries(
  Object.keys((DEFAULT_SETTINGS as any).options || {}).map((k) => {
    const key = `options.${k}`;
    return [
      key,
      booleanMeta({
        key,
        label: k,
        description: `Enable or disable the “${k}” command/action.`,
        section: "advanced-expert",
        subsection: "Commands",
      }),
    ] as const;
  })
) satisfies Record<string, TGSettingMeta<boolean>>;

const EXTRACTORS_META = Object.fromEntries(
  Object.keys((DEFAULT_SETTINGS as any).extractorsOptions || {}).map((k) => {
    const key = `extractorsOptions.${k}`;
    return [
      key,
      booleanMeta({
        key,
        label: k,
        description: `Enable or disable ${k}.`,
        section: "advanced-expert",
        subsection: "Extractors",
      }),
    ] as const;
  })
) satisfies Record<string, TGSettingMeta<boolean>>;

export const TG_SETTINGS_META = {
  ...BASE_META,
  ...OPTIONS_META,
  ...EXTRACTORS_META,
} satisfies Record<string, TGSettingMeta<any>>;

export type TGSettingMetaKey = keyof typeof TG_SETTINGS_META;
