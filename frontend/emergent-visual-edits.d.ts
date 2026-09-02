// Ambient declaration for the Emergent-private Vite plugin. The package resolves only
// inside the Emergent platform, so without this the config fails to typecheck on any
// ordinary clone — the plugin itself is loaded optionally at runtime.
declare module "@emergentbase/visual-edits/vite" {
  import type { PluginOption } from "vite";
  export function visualEdits(): PluginOption;
}
