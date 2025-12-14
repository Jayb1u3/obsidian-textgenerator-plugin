import get from "lodash.get";
import set from "lodash.set";
import type { TGSettingMeta, TGSettingsSectionId } from "./config-metadata";
import { TG_SETTINGS_META } from "./config-metadata";

export function getMeta(key: keyof typeof TG_SETTINGS_META): TGSettingMeta {
  return TG_SETTINGS_META[key];
}

export function getMetasForSection(section: TGSettingsSectionId) {
  return Object.values(TG_SETTINGS_META).filter((m) => m.section === section);
}

export function getValueByMeta<T = any>(settings: any, meta: TGSettingMeta<T>): T {
  return get(settings, meta.key) as T;
}

export function setValueByMeta<T = any>(settings: any, meta: TGSettingMeta<T>, value: T) {
  set(settings, meta.key, value);
}

export type NumberCoercionResult = {
  value: number;
  isValidNumber: boolean;
  wasClamped: boolean;
  clampedTo?: "min" | "max";
};

export function coerceNumberToMeta(
  raw: unknown,
  meta: TGSettingMeta<number>
): NumberCoercionResult {
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n)) {
    return { value: meta.default, isValidNumber: false, wasClamped: true };
  }

  let value = n;
  let wasClamped = false;
  let clampedTo: "min" | "max" | undefined;

  if (meta.min != null && value < meta.min) {
    value = meta.min;
    wasClamped = true;
    clampedTo = "min";
  }

  if (meta.max != null && value > meta.max) {
    value = meta.max;
    wasClamped = true;
    clampedTo = "max";
  }

  if (meta.step && meta.min != null) {
    const steps = Math.round((value - meta.min) / meta.step);
    value = meta.min + steps * meta.step;
    // avoid -0 / floating noise
    value = Number(value.toFixed(10));
  }

  return { value, isValidNumber: true, wasClamped, clampedTo };
}

export function isDefaultValue<T = any>(value: T, meta: TGSettingMeta<T>) {
  return value === meta.default;
}

export function isOutsideRecommended(value: number, meta: TGSettingMeta<number>) {
  if (!meta.recommendedRange) return false;
  return value < meta.recommendedRange.min || value > meta.recommendedRange.max;
}

