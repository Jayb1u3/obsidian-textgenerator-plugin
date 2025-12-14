import React, { useMemo, useState } from "react";
import useGlobal from "#/ui/context/global";
import { buildRequestBodyPreview } from "#/settings/request-payload";

export default function PayloadPreview() {
  const global = useGlobal();
  const [open, setOpen] = useState(false);

  const preview = useMemo(() => {
    const providerOriginalId = global.plugin.textGenerator.LLMProvider?.originalId;
    return buildRequestBodyPreview({
      settings: global.plugin.settings,
      providerOriginalId,
    });
  }, [global]);

  return (
    <div className="plug-tg-flex plug-tg-flex-col plug-tg-gap-2">
      <div className="plug-tg-flex plug-tg-items-center plug-tg-justify-between">
        <div className="plug-tg-text-xs plug-tg-opacity-70">
          Payload preview (best-effort)
        </div>
        <button className="plug-tg-btn plug-tg-btn-xs" onClick={() => setOpen((v) => !v)}>
          {open ? "Hide" : "Show"}
        </button>
      </div>
      {open && (
        <pre className="plug-tg-max-h-[240px] plug-tg-overflow-auto plug-tg-rounded-md plug-tg-bg-[var(--background-modifier-form-field)] plug-tg-p-2 plug-tg-font-mono plug-tg-text-[10px]">
          {JSON.stringify(preview, null, 2)}
        </pre>
      )}
    </div>
  );
}

