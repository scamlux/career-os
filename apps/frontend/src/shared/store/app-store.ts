'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FeatureKey } from '@/shared/features/feature-gates';
import { AppRole, SubscriptionPlan } from '@/shared/types/rbac';

type RightPanelMode = 'assistant' | 'inspector' | 'activity';

type AppStore = {
  userId: string;
  tenantId: string;
  email: string;
  token: string;
  refreshToken: string;
  role: AppRole;
  plan: SubscriptionPlan;
  aiCredits: number;
  commandPaletteOpen: boolean;
  rightPanelMode: RightPanelMode;
  featureFlags: Partial<Record<FeatureKey, boolean>>;
  setAuth: (input: {
    userId: string;
    tenantId: string;
    email: string;
    token: string;
    refreshToken: string;
    role: AppRole;
    plan: SubscriptionPlan;
  }) => void;
  logout: () => void;
  setRole: (role: AppRole) => void;
  setPlan: (plan: SubscriptionPlan) => void;
  setAiCredits: (credits: number) => void;
  toggleCommandPalette: (open?: boolean) => void;
  setRightPanelMode: (mode: RightPanelMode) => void;
  setFeatureFlag: (feature: FeatureKey, enabled: boolean) => void;
};

const initialState = {
  userId: '',
  tenantId: '',
  email: '',
  token: '',
  refreshToken: '',
  role: 'guest' as AppRole,
  plan: 'free' as SubscriptionPlan,
  aiCredits: 20,
  commandPaletteOpen: false,
  rightPanelMode: 'assistant' as RightPanelMode,
  featureFlags: {}
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...initialState,
      setAuth: (input) => {
        set({ ...input, aiCredits: 120 });
      },
      logout: () => {
        set(initialState);
      },
      setRole: (role) => set({ role }),
      setPlan: (plan) => set({ plan }),
      setAiCredits: (aiCredits) => set({ aiCredits }),
      toggleCommandPalette: (open) => set((state) => ({ commandPaletteOpen: open ?? !state.commandPaletteOpen })),
      setRightPanelMode: (rightPanelMode) => set({ rightPanelMode }),
      setFeatureFlag: (feature, enabled) =>
        set((state) => ({
          featureFlags: {
            ...state.featureFlags,
            [feature]: enabled
          }
        }))
    }),
    {
      name: 'careeros-app-store',
      partialize: (state) => ({
        userId: state.userId,
        tenantId: state.tenantId,
        email: state.email,
        token: state.token,
        refreshToken: state.refreshToken,
        role: state.role,
        plan: state.plan,
        aiCredits: state.aiCredits,
        featureFlags: state.featureFlags
      })
    }
  )
);
