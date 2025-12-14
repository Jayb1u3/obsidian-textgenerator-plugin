import clsx from "clsx";
import React, { useMemo, useState } from "react";
import type { TGSettingMetaKey } from "#/settings/config-metadata";
import type { TGSettingsPreset } from "#/settings/presets";

function shallowMatchPreset(
  preset: TGSettingsPreset,
  current: (key: TGSettingMetaKey) => any
) {
  const entries = Object.entries(preset.values) as [TGSettingMetaKey, any][];
  return entries.every(([k, v]) => current(k) === v);
}

export default function PresetBar(props: {
  presets: TGSettingsPreset[];
  getValue(key: TGSettingMetaKey): any;
  applyPreset(preset: TGSettingsPreset): void | Promise<void>;
}) {
  const [showDetails, setShowDetails] = useState(false);

  const activePreset = useMemo(() => {
    return props.presets.find((p) => shallowMatchPreset(p, props.getValue));
  }, [props.presets, props.getValue]);

  return (
    <div className="plug-tg-flex plug-tg-w-full plug-tg-flex-col plug-tg-gap-2">
      <div className="plug-tg-flex plug-tg-items-center plug-tg-justify-between plug-tg-gap-2">
        <div className="plug-tg-flex plug-tg-flex-wrap plug-tg-items-center plug-tg-gap-2">
          {props.presets.map((preset) => {
            const isActive = activePreset?.id === preset.id;
            return (
              <button
                key={preset.id}
                className={clsx("plug-tg-btn plug-tg-btn-xs", {
                  "plug-tg-outline plug-tg-outline-1 plug-tg-outline-blue-500":
                    isActive,
                })}
                onClick={() => props.applyPreset(preset)}
                title={preset.description}
              >
                {preset.label}
                {isActive ? " ✓" : ""}
              </button>
            );
          })}
        </div>

        <button
          className="plug-tg-btn plug-tg-btn-xs"
          onClick={() => setShowDetails((v) => !v)}
        >
          {showDetails ? "Hide" : "Inspect"}
        </button>
      </div>

      {showDetails && (
        <div className="plug-tg-rounded-md plug-tg-bg-[var(--background-modifier-form-field)] plug-tg-p-2">
          <div className="plug-tg-mb-1 plug-tg-text-xs plug-tg-opacity-80">
            Preset values (you can still adjust manually):
          </div>
          <div className="plug-tg-grid plug-tg-grid-cols-1 plug-tg-gap-1 md:plug-tg-grid-cols-2">
            {props.presets.map((preset) => (
              <div key={preset.id} className="plug-tg-text-[11px]">
                <div className="plug-tg-font-medium">{preset.label}</div>
                <pre className="plug-tg-whitespace-pre-wrap plug-tg-font-mono plug-tg-text-[10px] plug-tg-opacity-80">
                  {JSON.stringify(preset.values, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

