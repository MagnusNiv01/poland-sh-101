import type { ExportedPresetFile } from './types';
import { validateExportedPresetFile } from './presetValidation';

export const presetExportFileName = 'poland-sh101-presets.json';

export function serializePresetExport(file: ExportedPresetFile): string {
  return JSON.stringify(file, null, 2);
}

export function downloadPresetExport(file: ExportedPresetFile): void {
  const blob = new Blob([serializePresetExport(file)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = presetExportFileName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export async function readPresetExport(file: File): Promise<ExportedPresetFile> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    throw new Error('The selected file is not valid JSON.');
  }

  const validated = validateExportedPresetFile(parsed);
  if (!validated) {
    throw new Error('The selected file is not a compatible Poland SH-101 preset export.');
  }
  return validated;
}
