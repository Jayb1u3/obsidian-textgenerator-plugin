import React, { useEffect, useMemo, useState } from "react";
import Input from "../components/input";
import useGlobal from "#/ui/context/global";
import SettingsGroup from "../components/settingsGroup";
import MetaSetting from "../components/metaSetting";
import PresetBar from "../components/presetBar";
import PayloadPreview from "../components/payloadPreview";
import LLMProviderController from "../components/llmProviderController";
import { TG_PRESETS } from "#/settings/presets";
import { TG_SETTINGS_META } from "#/settings/config-metadata";
import Confirm from "#/ui/components/confirm";
import get from "lodash.get";
import set from "lodash.set";
import AvailableVars from "#/ui/components/availableVars";
import { contextVariablesObj } from "#/scope/context-manager";
import SettingItem from "../components/item";
import { ProviderServer } from "#/scope/package-manager/package-manager";
import AccountSettings from "./account";
import { useReloder } from "../components/reloadPlugin";
import OtherProvidersSetting from "./otherProviders";
// ------------------------------

export type Register = {
  listOfAllowed: string[];
  activeSections: Record<string, true>;
  searchTerm: string;
  register(id: string, searchInfo: string, section?: string): void;
  unRegister(id: string): void;
  checkAll(ids: string[]): boolean;
};

export default function SectionsMain() {
  const global = useGlobal();
  const [setReloader] = useReloder();
  const [items, setItems] = useState<
    Record<
      string,
      {
        term: string;
        sectionId?: string;
      }
    >
  >({});
  const [searchTerm, setSearchTerm] = useState<string>("");

  const searchedEntries = useMemo(
    () =>
      !searchTerm.length
        ? Object.entries(items)
        : Object.entries(items).filter(([key, val]) =>
          `${val.term} ${items[val.sectionId]?.term}`
            .toLocaleLowerCase()
            .includes(searchTerm.toLocaleLowerCase())
        ),
    [items, searchTerm]
  );

  const searchedItems = useMemo<string[]>(
    () => searchedEntries.map((e) => e[0]),
    [searchedEntries]
  );

  const activeSections = useMemo(() => {
    const obj: Record<string, true> = {};
    searchedEntries.forEach((e) => {
      if (e[1].sectionId) obj[e[1].sectionId] = true;
    });

    return obj;
  }, [searchedItems]);

  const register: Register = {
    listOfAllowed: searchedItems,
    activeSections,
    searchTerm,
    register(id, searchInfo, sectionId) {
      setItems((items) => {
        items[id] = {
          term: searchInfo,
          sectionId,
        };
        return { ...items };
      });
    },
    unRegister(id) {
      setItems((items) => {
        delete items[id];
        return { ...items };
      });
    },
    checkAll(ids) {
      return ids.every((id) => searchedItems.contains(id));
    },
  };

  const resetSectionToDefaults = async (section: string) => {
    if (
      !(await Confirm(
        `Reset “${section}” settings to defaults?`,
        "Reset Confirmation"
      ))
    )
      return;

    for (const meta of Object.values(TG_SETTINGS_META)) {
      if (meta.section !== section) continue;
      set(global.plugin.settings as any, meta.key, meta.default);
    }

    if (section === "advanced-expert") {
      try {
        await global.plugin.encryptAllKeys();
      } catch (err: any) {
        global.plugin.handelError(err);
      }
      setReloader(true);
    }

    if (section === "streaming-performance") {
      global.plugin.autoSuggest?.renderStatusBar();
      setReloader(true);
    }

    await global.plugin.saveSettings();
    global.triggerReload();
  };

  const generationPresetApply = async (preset: (typeof TG_PRESETS)[number]) => {
    for (const [k, v] of Object.entries(preset.values)) {
      const meta = (TG_SETTINGS_META as any)[k];
      if (!meta || meta.type === "custom") continue;
      set(global.plugin.settings as any, meta.key, v);
    }
    await global.plugin.saveSettings();
    global.triggerReload();
  };

  const getMetaValue = (metaKey: string) => {
    const meta = (TG_SETTINGS_META as any)[metaKey];
    if (!meta) return undefined;
    return get(global.plugin.settings as any, meta.key);
  };

  const modelEndpointId = "tg-settings-model-endpoint";
  const generationId = "tg-settings-generation";
  const streamingId = "tg-settings-streaming";
  const advancedId = "tg-settings-advanced";

  const autoSuggestEnabled = !!global.plugin.settings.autoSuggestOptions?.isEnabled;
  const inlineSuggestions = !!global.plugin.settings.autoSuggestOptions?.inlineSuggestions;
  const customAutoPrompt = !!global.plugin.settings.autoSuggestOptions?.customInstructEnabled;
  const customAutoProvider = !!global.plugin.settings.autoSuggestOptions?.customProvider;

  const titlePromptEnabled = !!global.plugin.settings.advancedOptions?.generateTitleInstructEnabled;
  const contextCustomEnabled = !!global.plugin.settings.context?.customInstructEnabled;

  return (
    <div className="plug-tg-flex plug-tg-w-full plug-tg-flex-col plug-tg-gap-3">
      <div className="w-full gap-2 plug-tg-flex plug-tg-flex-col plug-tg-justify-between md:plug-tg-flex-row">
        <div>
          <h1>Text Generator</h1>
        </div>
        <Input
          setValue={(val) => setSearchTerm(val.toLocaleLowerCase())}
          value={searchTerm}
          className="plug-tg-input-sm plug-tg-w-full lg:plug-tg-w-auto"
          placeholder="Search For Option"
        />
      </div>

      <div className="tags plug-tg-flex plug-tg-flex-wrap plug-tg-gap-2">
        <a
          className="tag"
          href={`https://github.com/nhaouari/obsidian-textgenerator-plugin/releases/tag/${global.plugin.manifest.version}`}
        >
          V{global.plugin.manifest.version}
        </a>
        <a className="tag" href="https://bit.ly/tg_docs">
          {"\u{1F4D6}"} Documentation
        </a>
        <a className="tag" href="https://bit.ly/Tg-discord">
          {"\u{1F44B}"} Discord
        </a>
        <a className="tag" href="https://bit.ly/tg-twitter2">
          {"\u{1F3A5}"} YouTube
        </a>
        <a className="tag" href="https://bit.ly/tg-twitter2">
          {"\u{1F426}"} Twitter
        </a>
      </div>

      <SettingsGroup
        id={modelEndpointId}
        storageKey="model-endpoint"
        title="Model & Endpoint"
        description="Choose provider profile, model, and endpoint settings."
        riskLabel="Safe"
        register={register}
        onReset={() => resetSectionToDefaults("model-endpoint")}
      >
        <div className="plug-tg-flex plug-tg-flex-col plug-tg-gap-2 plug-tg-p-2">
          <LLMProviderController
            register={register}
            sectionId={modelEndpointId}
            getSelectedProvider={() => global.plugin.settings.selectedProvider || ""}
            setSelectedProvider={(newVal) =>
              (global.plugin.settings.selectedProvider = (newVal as any) || "")
            }
            triggerResize={() => {}}
          />

          <MetaSetting metaKey="endpoint" register={register} sectionId={modelEndpointId} />

          <OtherProvidersSetting register={register} />
        </div>
      </SettingsGroup>

      <SettingsGroup
        id={generationId}
        storageKey="generation"
        title="Generation Controls"
        description="Tune creativity, length, and defaults."
        riskLabel="Moderate"
        register={register}
        onReset={() => resetSectionToDefaults("generation")}
      >
        <div className="plug-tg-flex plug-tg-flex-col plug-tg-gap-3 plug-tg-p-2">
          <PresetBar
            presets={TG_PRESETS}
            getValue={(k) => (getMetaValue(k) as any)}
            applyPreset={generationPresetApply}
          />

          <MetaSetting metaKey="max_tokens" register={register} sectionId={generationId} />
          <MetaSetting metaKey="temperature" register={register} sectionId={generationId} />
          <MetaSetting metaKey="frequency_penalty" register={register} sectionId={generationId} />
          <MetaSetting metaKey="prefix" register={register} sectionId={generationId} />

          <PayloadPreview />
        </div>
      </SettingsGroup>

      <SettingsGroup
        id={streamingId}
        storageKey="streaming-performance"
        title="Streaming & Performance"
        description="Streaming behavior, timeouts, and suggestions."
        riskLabel="Moderate"
        register={register}
        onReset={() => resetSectionToDefaults("streaming-performance")}
      >
        <div className="plug-tg-flex plug-tg-flex-col plug-tg-gap-3 plug-tg-p-2">
          <div className="plug-tg-text-xs plug-tg-opacity-70">Streaming</div>
          <MetaSetting metaKey="stream" register={register} sectionId={streamingId} />
          <MetaSetting
            metaKey="freeCursorOnStreaming"
            register={register}
            sectionId={streamingId}
          />

          <div className="plug-tg-text-xs plug-tg-opacity-70">Performance</div>
          <MetaSetting metaKey="requestTimeout" register={register} sectionId={streamingId} />
          <MetaSetting metaKey="showStatusBar" register={register} sectionId={streamingId} />

          <div className="plug-tg-text-xs plug-tg-opacity-70">Auto-Suggest</div>
          <MetaSetting
            metaKey="autoSuggestOptions.isEnabled"
            register={register}
            sectionId={streamingId}
          />
          {autoSuggestEnabled && (
            <>
              <MetaSetting
                metaKey="autoSuggestOptions.inlineSuggestions"
                register={register}
                sectionId={streamingId}
              />
              {inlineSuggestions && (
                <MetaSetting
                  metaKey="autoSuggestOptions.showInMarkdown"
                  register={register}
                  sectionId={streamingId}
                />
              )}

              <MetaSetting
                metaKey="autoSuggestOptions.triggerPhrase"
                register={register}
                sectionId={streamingId}
              />
              <MetaSetting
                metaKey="autoSuggestOptions.overrideTrigger"
                register={register}
                sectionId={streamingId}
              />
              <MetaSetting
                metaKey="autoSuggestOptions.delay"
                register={register}
                sectionId={streamingId}
              />
              <MetaSetting
                metaKey="autoSuggestOptions.numberOfSuggestions"
                register={register}
                sectionId={streamingId}
              />
              <MetaSetting
                metaKey="autoSuggestOptions.stop"
                register={register}
                sectionId={streamingId}
              />
              <MetaSetting
                metaKey="autoSuggestOptions.allowInNewLine"
                register={register}
                sectionId={streamingId}
              />
              <MetaSetting
                metaKey="autoSuggestOptions.showStatus"
                register={register}
                sectionId={streamingId}
              />

              <div className="plug-tg-text-xs plug-tg-opacity-70">Auto-Suggest Prompting</div>
              <MetaSetting
                metaKey="autoSuggestOptions.customInstructEnabled"
                register={register}
                sectionId={streamingId}
              />
              {customAutoPrompt && (
                <>
                  <MetaSetting
                    metaKey="autoSuggestOptions.customInstruct"
                    register={register}
                    sectionId={streamingId}
                  />
                  <AvailableVars
                    vars={{
                      ...contextVariablesObj,
                      query: {
                        example: "{{query}}",
                        hint: "query text that triggered auto-suggest",
                      },
                    }}
                  />
                  <MetaSetting
                    metaKey="autoSuggestOptions.systemPrompt"
                    register={register}
                    sectionId={streamingId}
                  />
                </>
              )}

              <div className="plug-tg-text-xs plug-tg-opacity-70">Auto-Suggest Provider</div>
              <MetaSetting
                metaKey="autoSuggestOptions.customProvider"
                register={register}
                sectionId={streamingId}
              />
              {customAutoProvider && (
                <LLMProviderController
                  register={register}
                  sectionId={streamingId}
                  getSelectedProvider={() =>
                    global.plugin.settings.autoSuggestOptions.selectedProvider || ""
                  }
                  setSelectedProvider={(newVal) =>
                    (global.plugin.settings.autoSuggestOptions.selectedProvider =
                      (newVal as any) || "")
                  }
                  triggerResize={() => {}}
                  mini
                />
              )}
            </>
          )}

          <div className="plug-tg-text-xs plug-tg-opacity-70">Slash Suggest</div>
          <MetaSetting
            metaKey="slashSuggestOptions.isEnabled"
            register={register}
            sectionId={streamingId}
          />
          <MetaSetting
            metaKey="slashSuggestOptions.triggerPhrase"
            register={register}
            sectionId={streamingId}
          />
        </div>
      </SettingsGroup>

      <SettingsGroup
        id={advancedId}
        storageKey="advanced-expert"
        title="Advanced / Expert"
        description="High-impact options, templates, commands, and extractors."
        riskLabel="Expert"
        register={register}
        onReset={() => resetSectionToDefaults("advanced-expert")}
      >
        <div className="plug-tg-flex plug-tg-flex-col plug-tg-gap-3 plug-tg-p-2">
          <div className="plug-tg-text-xs plug-tg-opacity-70">Debugging</div>
          <MetaSetting metaKey="displayErrorInEditor" register={register} sectionId={advancedId} />

          <div className="plug-tg-text-xs plug-tg-opacity-70">Output</div>
          <MetaSetting metaKey="outputToBlockQuote" register={register} sectionId={advancedId} />

          <div className="plug-tg-text-xs plug-tg-opacity-70">Security</div>
          <MetaSetting metaKey="encrypt_keys" register={register} sectionId={advancedId} />
          <MetaSetting metaKey="allowJavascriptRun" register={register} sectionId={advancedId} />

          <div className="plug-tg-text-xs plug-tg-opacity-70">Context</div>
          <MetaSetting
            metaKey="advancedOptions.includeAttachmentsInRequest"
            register={register}
            sectionId={advancedId}
          />

          <div className="plug-tg-text-xs plug-tg-opacity-70">Prompting</div>
          <MetaSetting
            metaKey="context.customInstructEnabled"
            register={register}
            sectionId={advancedId}
          />
          {contextCustomEnabled && (
            <>
              <MetaSetting
                metaKey="context.customInstruct"
                register={register}
                sectionId={advancedId}
              />
              <AvailableVars vars={contextVariablesObj} />
            </>
          )}

          <MetaSetting
            metaKey="advancedOptions.generateTitleInstructEnabled"
            register={register}
            sectionId={advancedId}
          />
          {titlePromptEnabled && (
            <>
              <MetaSetting
                metaKey="advancedOptions.generateTitleInstruct"
                register={register}
                sectionId={advancedId}
              />
              <AvailableVars
                vars={{
                  ...contextVariablesObj,
                  query: {
                    example: "{{content255}}",
                    hint: "first 255 letters of trimmed content of the note",
                  },
                }}
              />
            </>
          )}

          <div className="plug-tg-text-xs plug-tg-opacity-70">Templates</div>
          <MetaSetting metaKey="tgSelectionLimiter" register={register} sectionId={advancedId} />
          <MetaSetting
            metaKey="context.contextTemplate"
            register={register}
            sectionId={advancedId}
          />
          <AvailableVars vars={contextVariablesObj} />
          <MetaSetting metaKey="context.includeClipboard" register={register} sectionId={advancedId} />

          <div className="plug-tg-text-xs plug-tg-opacity-70">Paths</div>
          <MetaSetting metaKey="promptsPath" register={register} sectionId={advancedId} />
          <MetaSetting metaKey="textGenPath" register={register} sectionId={advancedId} />

          <div className="plug-tg-text-xs plug-tg-opacity-70">Experimental</div>
          <MetaSetting metaKey="experiment" register={register} sectionId={advancedId} />

          <div className="plug-tg-text-xs plug-tg-opacity-70">Extractors</div>
          {Object.keys(global.plugin.defaultSettings.extractorsOptions).map((k) => (
            <MetaSetting
              key={`extractorsOptions.${k}`}
              metaKey={`extractorsOptions.${k}`}
              register={register}
              sectionId={advancedId}
            />
          ))}

          <div className="plug-tg-text-xs plug-tg-opacity-70">Commands</div>
          {Object.keys(global.plugin.defaultSettings.options).map((k) => (
            <MetaSetting
              key={`options.${k}`}
              metaKey={`options.${k}`}
              register={register}
              sectionId={advancedId}
            />
          ))}

          {!!ProviderServer && (
            <>
              <div className="plug-tg-text-xs plug-tg-opacity-70">Account</div>
              <AccountSettings register={register} />
            </>
          )}

          <div className="plug-tg-text-xs plug-tg-opacity-70">Maintenance</div>
          <SettingItem
            name="Reload Plugin"
            description="Some changes require reloading to fully apply."
            register={register}
            sectionId={advancedId}
          >
            <button className="plug-tg-btn plug-tg-btn-xs" onClick={() => global.plugin.reload()}>
              Reload
            </button>
          </SettingItem>
          <SettingItem
            name="Reset All Settings"
            description="Deletes all configuration and restores defaults."
            register={register}
            sectionId={advancedId}
          >
            <button
              className="plug-tg-btn-danger"
              onClick={async () => {
                if (
                  !(await Confirm(
                    "Are you sure you want to reset ALL settings to defaults?",
                    "Reset Confirmation"
                  ))
                )
                  return;
                await global.plugin.resetSettingsToDefault();
                await global.plugin.reload();
              }}
            >
              Reset
            </button>
          </SettingItem>
        </div>
      </SettingsGroup>
    </div>
  );
}
