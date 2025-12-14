import clsx from "clsx";
import React, { useMemo, useState } from "react";
import type { TGSettingMeta } from "#/settings/config-metadata";
import {
  coerceNumberToMeta,
  isOutsideRecommended,
} from "#/settings/config-meta-utils";

export default function SliderControl(props: {
  meta: TGSettingMeta<number>;
  value: unknown;
  onChange(value: number): void | Promise<void>;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const { meta } = props;
  const coerced = useMemo(() => coerceNumberToMeta(props.value, meta), [props.value, meta]);

  const [showDirect, setShowDirect] = useState(!!meta.slider?.allowDirectEntry);

  const isDefault = coerced.value === meta.default;
  const isRecommendedWarning = isOutsideRecommended(coerced.value, meta);
  const isInvalid = !coerced.isValidNumber;

  const state: "default" | "modified" | "recommended" | "invalid" | "disabled" =
    props.disabled
      ? "disabled"
      : isInvalid
        ? "invalid"
        : isDefault
          ? "default"
          : isRecommendedWarning
            ? "recommended"
            : "modified";

  return (
    <div className="plug-tg-flex plug-tg-min-w-[260px] plug-tg-flex-col plug-tg-gap-1">
      <div className="plug-tg-flex plug-tg-items-center plug-tg-gap-2">
        <div
          className={clsx(
            "plug-tg-flex plug-tg-flex-1 plug-tg-items-center plug-tg-gap-2 plug-tg-rounded-md plug-tg-px-2 plug-tg-py-1",
            {
              "plug-tg-opacity-60": state === "disabled",
              "plug-tg-outline plug-tg-outline-1 plug-tg-outline-red-500":
                state === "invalid",
              "plug-tg-outline plug-tg-outline-1 plug-tg-outline-amber-500":
                state === "recommended",
              "plug-tg-outline plug-tg-outline-1 plug-tg-outline-blue-500":
                state === "modified",
            }
          )}
        >
          <input
            type="range"
            className={clsx("plug-tg-w-full", {
              "plug-tg-cursor-not-allowed": state === "disabled",
            })}
            min={meta.min ?? 0}
            max={meta.max ?? 100}
            step={meta.step ?? 1}
            value={coerced.value}
            disabled={props.disabled}
            onChange={(e) => props.onChange(Number(e.target.value))}
          />

          <div className="plug-tg-flex plug-tg-items-center plug-tg-gap-2">
            {showDirect ? (
              <input
                type="number"
                className={clsx(
                  "plug-tg-input plug-tg-w-[110px] plug-tg-bg-[var(--background-modifier-form-field)]"
                )}
                min={meta.min ?? undefined}
                max={meta.max ?? undefined}
                step={meta.step ?? undefined}
                value={coerced.value}
                disabled={props.disabled}
                onChange={(e) => props.onChange(Number(e.target.value))}
              />
            ) : (
              <div className="plug-tg-min-w-[72px] plug-tg-text-right plug-tg-font-mono plug-tg-text-xs">
                {coerced.value}
                {meta.slider?.unit ? ` ${meta.slider.unit}` : ""}
              </div>
            )}

            {!!meta.slider?.allowDirectEntry && (
              <button
                className={clsx("plug-tg-btn plug-tg-btn-xs", {
                  "plug-tg-btn-disabled": props.disabled,
                })}
                disabled={props.disabled}
                onClick={() => setShowDirect((v) => !v)}
                title={showDirect ? "Hide numeric entry" : "Show numeric entry"}
              >
                {showDirect ? "◻︎" : "123"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="plug-tg-flex plug-tg-flex-wrap plug-tg-justify-between plug-tg-gap-2 plug-tg-text-[10px] plug-tg-opacity-70">
        <div>
          Default: <span className="plug-tg-font-mono">{meta.default}</span>
        </div>
        {meta.recommendedRange && (
          <div>
            Recommended:{" "}
            <span className="plug-tg-font-mono">
              {meta.recommendedRange.min}–{meta.recommendedRange.max}
            </span>
          </div>
        )}
      </div>

      {props.disabledReason && state === "disabled" && (
        <div className="plug-tg-text-[10px] plug-tg-opacity-70">
          {props.disabledReason}
        </div>
      )}
      {coerced.wasClamped && state !== "disabled" && (
        <div className="plug-tg-text-[10px] plug-tg-text-amber-400">
          Clamped to {coerced.clampedTo ?? "limits"}
        </div>
      )}
    </div>
  );
}

