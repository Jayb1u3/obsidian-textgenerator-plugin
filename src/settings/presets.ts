import type { TGSettingMetaKey } from "./config-metadata";

export type PresetId = "balanced" | "creative" | "deterministic";

export type TGSettingsPreset = {
  id: PresetId;
  label: string;
  description: string;
  values: Partial<Record<TGSettingMetaKey, any>>;
};

export const TG_PRESETS: TGSettingsPreset[] = [
  {
    id: "balanced",
    label: "Balanced",
    description: "General-purpose defaults.",
    values: {
      temperature: 0.7,
      frequency_penalty: 0.5,
      max_tokens: 5000,
    },
  },
  {
    id: "creative",
    label: "Creative",
    description: "More diverse wording and ideas.",
    values: {
      temperature: 1.1,
      frequency_penalty: 0.2,
      max_tokens: 5000,
    },
  },
  {
    id: "deterministic",
    label: "Deterministic",
    description: "More consistent and repeatable outputs.",
    values: {
      temperature: 0.2,
      frequency_penalty: 0,
      max_tokens: 5000,
    },
  },
];

