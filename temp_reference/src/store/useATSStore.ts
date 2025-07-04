import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ATSConfig } from '@/services/atsIntegration';

interface ATSStore {
    config: ATSConfig | null;
    isConnected: boolean;
    lastSync: string | null;
    syncInProgress: boolean;
    error: string | null;
    setConfig: (config: ATSConfig) => void;
    setConnectionStatus: (status: boolean) => void;
    setSyncStatus: (inProgress: boolean) => void;
    updateLastSync: (date: string) => void;
    setError: (error: string | null) => void;
    clearConfig: () => void;
}

const useATSStore = create<ATSStore>()(
    persist(
        (set) => ({
            config: null,
            isConnected: false,
            lastSync: null,
            syncInProgress: false,
            error: null,
            setConfig: (config) => set({ config, isConnected: true, error: null }),
            setConnectionStatus: (status) => set({ isConnected: status }),
            setSyncStatus: (inProgress) => set({ syncInProgress: inProgress }),
            updateLastSync: (date) => set({ lastSync: date }),
            setError: (error) => set({ error }),
            clearConfig: () => set({
                config: null,
                isConnected: false,
                lastSync: null,
                error: null
            }),
        }),
        {
            name: 'ats-store',
        }
    )
);

export default useATSStore; 