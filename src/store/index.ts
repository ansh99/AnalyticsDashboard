import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, UploadedFile } from '@/lib/types';

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            files: [],
            activeFileId: null,
            geminiApiKey: null,

            addFile: (file) => set((state) => ({
                files: [...state.files, file],
                activeFileId: state.activeFileId ? state.activeFileId : file.id
            })),

            removeFile: (id) => set((state) => {
                const newFiles = state.files.filter(f => f.id !== id);
                return {
                    files: newFiles,
                    activeFileId: state.activeFileId === id ? (newFiles[0]?.id || null) : state.activeFileId
                };
            }),

            setActiveFile: (id) => set({ activeFileId: id }),

            setGeminiApiKey: (key) => set({ geminiApiKey: key }),

            clearFiles: () => set({ files: [], activeFileId: null }),
        }),
        {
            name: 'dashboard-storage',
            partialize: (state) => ({ geminiApiKey: state.geminiApiKey }), // Only persist API key
        }
    )
);
