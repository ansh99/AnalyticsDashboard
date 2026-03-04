import LZString from 'lz-string';
import { AppState } from './types';

export function createShareSnapshot(state: AppState) {
    // Extract minimal required data for read-only view
    const snapshot = {
        files: state.files,
        activeFileId: state.activeFileId,
    };
    const jsonStr = JSON.stringify(snapshot);
    return LZString.compressToEncodedURIComponent(jsonStr);
}

export function decodeShareSnapshot(encodedStr: string): Partial<AppState> | null {
    try {
        const jsonStr = LZString.decompressFromEncodedURIComponent(encodedStr);
        if (!jsonStr) return null;
        return JSON.parse(jsonStr) as Partial<AppState>;
    } catch (e) {
        console.error("Failed to decode snapshot", e);
        return null;
    }
}
