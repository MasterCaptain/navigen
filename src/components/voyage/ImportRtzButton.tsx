import React from "react";
import { parseRtz } from "../../lib/rtz/parseRtz";
import { importRtzToDb } from "../../lib/rtz/importRtz";

export function ImportRtzButton({ onImported }: { onImported?: (routeId: string) => void }) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function handleFile(file: File) {
    setBusy(true);
    try {
      const text = await file.text();
      const parsed = parseRtz(text);
      const route = await importRtzToDb(parsed);
      console.log("RTZ import ok:", route.id, parsed.waypoints.length);
      onImported?.(route.id);
      alert(`Imported: ${parsed.routeName} (${parsed.waypoints.length} waypoints)`);
    } catch (e: any) {
      console.error(e);
      alert(`RTZ import failed: ${e?.message ?? String(e)}`);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <button
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        style={{ 
          padding: 10, 
          borderRadius: 10,
          opacity: busy ? 0.5 : 1,
          cursor: busy ? "not-allowed" : "pointer"
        }}
        title="Import RTZ file"
      >
        {busy ? "Importing..." : "Import RTZ"}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".rtz,.xml,application/xml,text/xml"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
    </div>
  );
}