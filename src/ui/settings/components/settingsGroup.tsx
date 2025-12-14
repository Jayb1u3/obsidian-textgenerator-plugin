import clsx from "clsx";
import React, { useEffect, useMemo, useState } from "react";
import type { Register } from "../sections";

function loadCollapsed(storageKey: string, fallback: boolean) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw == null) return fallback;
    return raw === "true";
  } catch {
    return fallback;
  }
}

function saveCollapsed(storageKey: string, collapsed: boolean) {
  try {
    localStorage.setItem(storageKey, collapsed ? "true" : "false");
  } catch {
    // ignore
  }
}

export default function SettingsGroup(props: {
  id: string;
  title: string;
  description?: string;
  riskLabel?: "Safe" | "Moderate" | "Expert";
  storageKey: string;
  register: Register;
  onReset?: () => void | Promise<void>;
  children: React.ReactNode;
}) {
  const storageKey = useMemo(
    () => `tg.settings.group.collapsed.${props.storageKey}`,
    [props.storageKey]
  );

  const [collapsed, setCollapsed] = useState<boolean>(() =>
    loadCollapsed(storageKey, false)
  );

  useEffect(() => {
    props.register.register(props.id, `${props.title} ${props.description || ""}`, props.id);
  }, [props.id]);

  // Auto-expand when searching and this section has hits; restore persisted state when cleared.
  useEffect(() => {
    if (props.register.searchTerm.length) {
      if (props.register.activeSections[props.id]) setCollapsed(false);
      return;
    }
    setCollapsed(loadCollapsed(storageKey, false));
  }, [props.register.searchTerm.length, props.register.activeSections[props.id]]);

  useEffect(() => {
    saveCollapsed(storageKey, collapsed);
  }, [storageKey, collapsed]);

  return (
    <div
      className={clsx("plug-tg-collapse plug-tg-w-full", {
        "plug-tg-collapse-open": !collapsed,
        "plug-tg-max-h-16 plug-tg-opacity-60": collapsed,
      })}
    >
      <div
        className={clsx("plug-tg-group plug-tg-cursor-pointer plug-tg-px-2", {
          "hover:plug-tg-bg-gray-100/10": collapsed,
        })}
        onClick={() => setCollapsed((v) => !v)}
      >
        <div className="plug-tg-flex plug-tg-items-center plug-tg-justify-between plug-tg-gap-2">
          <div className="plug-tg-flex plug-tg-flex-col">
            <h3 className="plug-tg-m-0">{props.title}</h3>
            {!!props.description && (
              <div className="plug-tg-text-[11px] plug-tg-opacity-70">
                {props.description}
              </div>
            )}
          </div>

          <div className="plug-tg-flex plug-tg-items-center plug-tg-gap-2">
            {!!props.riskLabel && (
              <div
                className={clsx(
                  "plug-tg-rounded-full plug-tg-px-2 plug-tg-py-[2px] plug-tg-text-[10px]",
                  {
                    "plug-tg-bg-green-500/10 plug-tg-text-green-300":
                      props.riskLabel === "Safe",
                    "plug-tg-bg-amber-500/10 plug-tg-text-amber-300":
                      props.riskLabel === "Moderate",
                    "plug-tg-bg-red-500/10 plug-tg-text-red-300":
                      props.riskLabel === "Expert",
                  }
                )}
              >
                {props.riskLabel}
              </div>
            )}

            {!!props.onReset && (
              <button
                className="plug-tg-btn plug-tg-btn-xs"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  props.onReset?.();
                }}
                title="Reset this section to defaults"
              >
                Reset
              </button>
            )}

            <svg
              className={clsx(
                "plug-tg-h-3 plug-tg-w-3 plug-tg-shrink-0 plug-tg-transition-all",
                {
                  "-plug-tg-rotate-180": !collapsed,
                  "plug-tg-upsidedown": collapsed,
                }
              )}
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 10 6"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5 5 1 1 5"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="plug-tg-collapse-content plug-tg-w-full">{props.children}</div>
    </div>
  );
}
