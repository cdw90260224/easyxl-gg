import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type AnalysisHistoryRecord } from '../services/historyService';
import { toast } from 'sonner';

export interface Sheet {
    id: string;
    name: string;
    data: any[];
    columns: string[];
}

interface AppState {
    // ── 핵심 데이터 ──
    sheets: Sheet[];
    activeSheetIndex: number;
    analysisHistory: AnalysisHistoryRecord[]; // 비로그인 전용 히스토리 보관함
    
    // ── 세션 상태 ──
    isDark: boolean;
    
    // ── 액션 ──
    setSheets: (sheets: Sheet[] | ((prev: Sheet[]) => Sheet[])) => void;
    setActiveSheetIndex: (index: number | ((prev: number) => number)) => void;
    addSheet: (sheet: Sheet) => void;
    deleteSheet: (index: number) => void;
    renameSheet: (index: number, newName: string) => void;
    setHistory: (history: AnalysisHistoryRecord[]) => void;
    addHistoryItem: (item: AnalysisHistoryRecord) => void;
    toggleDark: () => void;
    clearGuestData: () => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            sheets: [],
            activeSheetIndex: 0,
            analysisHistory: [],
            isDark: false,

            setSheets: (update) => set((state) => ({ 
                sheets: typeof update === 'function' ? update(state.sheets) : update 
            })),
            setActiveSheetIndex: (update) => set((state) => ({ 
                activeSheetIndex: typeof update === 'function' ? update(state.activeSheetIndex) : update 
            })),
            addSheet: (sheet) => set((state) => ({ 
                sheets: [...state.sheets, sheet],
                activeSheetIndex: state.sheets.length 
            })),
            deleteSheet: (index) => set((state) => {
                const newSheets = state.sheets.filter((_, i) => i !== index);
                let nextIdx = state.activeSheetIndex;
                if (index < state.activeSheetIndex) nextIdx = state.activeSheetIndex - 1;
                else if (index === state.activeSheetIndex) nextIdx = 0;
                return { sheets: newSheets, activeSheetIndex: nextIdx };
            }),
            renameSheet: (index, newName) => set((state) => {
                const newSheets = [...state.sheets];
                if (newSheets[index]) {
                    newSheets[index] = { ...newSheets[index], name: newName };
                }
                return { sheets: newSheets };
            }),

            setHistory: (history) => set({ analysisHistory: history }),
            addHistoryItem: (item) => set((state) => {
                // FIFO: 최대 5개 유지
                const isLimitReached = state.analysisHistory.length >= 5;
                if (isLimitReached) {
                    toast.info("저장 용량 최적화를 위해 가장 오래된 기록을 삭제합니다.", {
                        description: "비로그인 상태에서는 최근 5개의 분석 데이터만 보관됩니다."
                    });
                }
                const newHistory = [item, ...state.analysisHistory].slice(0, 5);
                return { analysisHistory: newHistory };
            }),

            toggleDark: () => set((state) => ({ isDark: !state.isDark })),
            
            clearGuestData: () => set({ sheets: [], analysisHistory: [], activeSheetIndex: 0 }),
        }),
        {
            name: 'easyxl-app-storage', 
            storage: createJSONStorage(() => localStorage),
        }
    )
);
