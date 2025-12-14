import React from "react";
import useGlobal from "#/ui/context/global";
import SettingItem from "./item";
import Input from "./input";
import SliderControl from "./sliderControl";
import type { Register } from "../sections";
import { TG_SETTINGS_META, type TGSettingMeta } from "#/settings/config-metadata";
import {
  coerceNumberToMeta,
  getValueByMeta,
  setValueByMeta,
} from "#/settings/config-meta-utils";
import { useReloder } from "./reloadPlugin";

function getSelectedModel(global: ReturnType<typeof useGlobal>) {
  const id = global.plugin.settings.selectedProvider as any;
  return global.plugin.settings.LLMProviderOptions?.[id]?.model as string | undefined;
}

function isOpenAIChatModelDisallowingPenalties(modelId: string | undefined) {
  if (!modelId) return false;
  const m = modelId.toLowerCase();
  return m.startsWith("gpt-5") || m === "chat-latest";
}

export default function MetaSetting(props: {
  metaKey: string;
  register: Register;
  sectionId: string;
  /**
   * Optional custom renderer for special cases (e.g. provider pickers).
   * If provided, it receives the meta and must handle persistence.
   */
  customRender?: (meta: TGSettingMeta<any>) => React.ReactNode;
}) {
  const global = useGlobal();
  const [setReloader] = useReloder();
  const meta = (TG_SETTINGS_META as Record<string, TGSettingMeta<any>>)[props.metaKey];

  if (!meta) return null;
  const value = getValueByMeta(global.plugin.settings, meta);

  const disabledInfo = (() => {
    if (meta.key === "stream") {
      const streamable = global.plugin.textGenerator.LLMProvider?.streamable;
      if (streamable === false) {
        return { disabled: true, reason: "Disabled: provider does not support streaming." };
      }
    }
    if (meta.key === "frequency_penalty") {
      const model = getSelectedModel(global);
      const providerOriginalId = global.plugin.textGenerator.LLMProvider?.originalId;
      if (
        providerOriginalId === "OpenAI Chat (Langchain)" &&
        isOpenAIChatModelDisallowingPenalties(model)
      ) {
        return {
          disabled: true,
          reason: `Disabled for ${model} (penalties not supported).`,
        };
      }
    }
    return { disabled: false as const, reason: undefined as string | undefined };
  })();

  const save = async () => {
    await global.plugin.saveSettings();
    global.triggerReload();
  };

  const setAndSave = async (next: any) => {
    const requiresReload =
      meta.key === "encrypt_keys" ||
      meta.key.startsWith("options.") ||
      meta.key === "autoSuggestOptions.isEnabled" ||
      meta.key === "autoSuggestOptions.inlineSuggestions" ||
      meta.key === "autoSuggestOptions.showInMarkdown";

    setValueByMeta(global.plugin.settings, meta, next);

    if (meta.key === "encrypt_keys") {
      try {
        await global.plugin.encryptAllKeys();
      } catch (err: any) {
        global.plugin.handelError(err);
      }
    }

    if (
      meta.key === "autoSuggestOptions.isEnabled" ||
      meta.key === "autoSuggestOptions.showStatus" ||
      meta.key === "autoSuggestOptions.allowInNewLine" ||
      meta.key === "autoSuggestOptions.customProvider"
    ) {
      global.plugin.autoSuggest?.renderStatusBar();
    }

    if (requiresReload) setReloader(true);
    await save();
  };

  const renderControl = () => {
    if (props.customRender) return props.customRender(meta);
    if (meta.type === "custom") return null;

    if (meta.type === "boolean") {
      return (
        <Input
          type="checkbox"
          value={"" + !!value}
          setValue={async (val) => setAndSave(val === "true")}
        />
      );
    }

    if (meta.type === "number") {
      return (
        <SliderControl
          meta={meta as TGSettingMeta<number>}
          value={value}
          disabled={disabledInfo.disabled}
          disabledReason={disabledInfo.reason}
          onChange={async (raw) => {
            const coerced = coerceNumberToMeta(raw, meta as TGSettingMeta<number>);
            await setAndSave(coerced.value);
          }}
        />
      );
    }

    if (meta.type === "textarea") {
      return (
        <textarea
          className="plug-tg-input plug-tg-h-fit plug-tg-w-full plug-tg-resize-y plug-tg-bg-[var(--background-modifier-form-field)] plug-tg-outline-none"
          value={value ?? meta.default ?? ""}
          onChange={async (e) => setAndSave(e.target.value)}
          spellCheck={false}
          rows={10}
        />
      );
    }

    // string
    const formatted =
      meta.key === "prefix" && typeof value === "string"
        ? value.replaceAll("\n", "\\n")
        : (value ?? "");

    return (
      <Input
        value={"" + formatted}
        placeholder={meta.label}
        setValue={async (val) => {
          if (meta.key === "prefix") {
            await setAndSave(val.replaceAll("\\n", "\n"));
            return;
          }
          await setAndSave(val);
        }}
      />
    );
  };

  return (
    <SettingItem
      name={meta.label}
      description={meta.description}
      register={props.register}
      sectionId={props.sectionId}
      textArea={meta.type === "textarea"}
    >
      {renderControl()}
    </SettingItem>
  );
}
