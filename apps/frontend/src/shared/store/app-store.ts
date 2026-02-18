'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FeatureKey } from '@/shared/features/feature-gates';
import { AppRole, SubscriptionPlan } from '@/shared/types/rbac';

type RightPanelMode = 'assistant' | 'inspector' | 'activity';
export type ServiceMode = 'ai_hr' | 'roadmap' | 'courses';

type AIMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
};

type AISession = {
  id: string;
  title: string;
  messages: AIMessage[];
};

type RoadmapNode = {
  id: string;
  label: string;
  progress: number;
  x: number;
  y: number;
};

type DiscoveryAnswer = {
  question: string;
  answer: string;
};

type RoadmapDraft = {
  id: string;
  title?: string;
  roleTarget: string;
  grade: string;
  interviewLog?: DiscoveryAnswer[];
  canvasViewport?: { x: number; y: number; scale: number };
  roadmapNodes?: RoadmapNode[];
  createdAt: number;
  updatedAt?: number;
};

type CoursesState = {
  activeCourseId: string;
  activeLessonId: string;
  enrolledCourseIds: string[];
  progressByCourse: Record<string, number>;
};

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
  mode: ServiceMode;
  featureFlags: Partial<Record<FeatureKey, boolean>>;
  aiSessions: AISession[];
  currentAISessionId: string;
  roadmapNodes: RoadmapNode[];
  roadmapViewport: { x: number; y: number; scale: number };
  roadmapDiscovery: DiscoveryAnswer[];
  roadmapDrafts: RoadmapDraft[];
  activeRoadmapDraftId: string;
  coursesState: CoursesState;
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
  setMode: (mode: ServiceMode) => void;
  startAISession: (title?: string) => void;
  setCurrentAISession: (sessionId: string) => void;
  appendAIMessage: (message: AIMessage) => void;
  setRoadmapViewport: (viewport: { x: number; y: number; scale: number }) => void;
  setRoadmapNodes: (nodes: RoadmapNode[]) => void;
  addRoadmapDiscoveryAnswer: (item: DiscoveryAnswer) => void;
  clearRoadmapDiscovery: () => void;
  addRoadmapDraft: (draft: RoadmapDraft) => void;
  setRoadmapDrafts: (drafts: RoadmapDraft[]) => void;
  setActiveRoadmapDraftId: (draftId: string) => void;
  setActiveCourse: (courseId: string) => void;
  setActiveLesson: (lessonId: string) => void;
  toggleEnrollCourse: (courseId: string) => void;
  setCourseProgress: (courseId: string, progress: number) => void;
};

function createDefaultNodes(): RoadmapNode[] {
  const nodes: RoadmapNode[] = [];
  for (let i = 0; i < 42; i += 1) {
    const row = Math.floor(i / 6);
    const col = i % 6;
    nodes.push({
      id: `node-${i + 1}`,
      label: `Skill ${i + 1}`,
      progress: (i * 7) % 100,
      x: col * 210,
      y: row * 130
    });
  }

  return nodes;
}

const defaultSessionId = 'session-default';

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
  mode: 'ai_hr' as ServiceMode,
  featureFlags: {},
  aiSessions: [
    {
      id: defaultSessionId,
      title: 'Career Discovery',
      messages: [
        {
          id: 'welcome-msg',
          role: 'assistant',
          content: 'Привет. Я AI-HR ментор. Расскажи, какую профессию ты хочешь освоить и какой у тебя текущий опыт.',
          createdAt: Date.now()
        }
      ]
    }
  ] as AISession[],
  currentAISessionId: defaultSessionId,
  roadmapNodes: createDefaultNodes(),
  roadmapViewport: { x: 0, y: 0, scale: 1 },
  roadmapDiscovery: [] as DiscoveryAnswer[],
  roadmapDrafts: [] as RoadmapDraft[],
  activeRoadmapDraftId: '',
  coursesState: {
    activeCourseId: '',
    activeLessonId: '',
    enrolledCourseIds: [],
    progressByCourse: {}
  } as CoursesState
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
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
        })),
      setMode: (mode) => set({ mode }),
      startAISession: (title) => {
        const nextId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `session-${Date.now()}`;
        set((state) => ({
          aiSessions: [
            {
              id: nextId,
              title: title ?? `Session ${state.aiSessions.length + 1}`,
              messages: []
            },
            ...state.aiSessions
          ],
          currentAISessionId: nextId
        }));
      },
      setCurrentAISession: (currentAISessionId) => set({ currentAISessionId }),
      appendAIMessage: (message) => {
        const currentId = get().currentAISessionId;
        set((state) => ({
          aiSessions: state.aiSessions.map((session) =>
            session.id === currentId
              ? {
                  ...session,
                  messages: [...session.messages, message]
                }
              : session
          )
        }));
      },
      setRoadmapViewport: (roadmapViewport) => set({ roadmapViewport }),
      setRoadmapNodes: (roadmapNodes) => set({ roadmapNodes }),
      addRoadmapDiscoveryAnswer: (item) =>
        set((state) => ({
          roadmapDiscovery: [...state.roadmapDiscovery, item]
        })),
      clearRoadmapDiscovery: () => set({ roadmapDiscovery: [] }),
      addRoadmapDraft: (draft) =>
        set((state) => ({
          roadmapDrafts: [draft, ...state.roadmapDrafts]
        })),
      setRoadmapDrafts: (roadmapDrafts) => set({ roadmapDrafts }),
      setActiveRoadmapDraftId: (activeRoadmapDraftId) => set({ activeRoadmapDraftId }),
      setActiveCourse: (courseId) =>
        set((state) => ({
          coursesState: {
            ...state.coursesState,
            activeCourseId: courseId
          }
        })),
      setActiveLesson: (lessonId) =>
        set((state) => ({
          coursesState: {
            ...state.coursesState,
            activeLessonId: lessonId
          }
        })),
      toggleEnrollCourse: (courseId) =>
        set((state) => {
          const exists = state.coursesState.enrolledCourseIds.includes(courseId);
          return {
            coursesState: {
              ...state.coursesState,
              enrolledCourseIds: exists
                ? state.coursesState.enrolledCourseIds.filter((id) => id !== courseId)
                : [...state.coursesState.enrolledCourseIds, courseId]
            }
          };
        }),
      setCourseProgress: (courseId, progress) =>
        set((state) => ({
          coursesState: {
            ...state.coursesState,
            progressByCourse: {
              ...state.coursesState.progressByCourse,
              [courseId]: Math.max(0, Math.min(100, progress))
            }
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
        featureFlags: state.featureFlags,
        mode: state.mode,
        aiSessions: state.aiSessions,
        currentAISessionId: state.currentAISessionId,
        roadmapNodes: state.roadmapNodes,
        roadmapViewport: state.roadmapViewport,
        roadmapDiscovery: state.roadmapDiscovery,
        roadmapDrafts: state.roadmapDrafts,
        activeRoadmapDraftId: state.activeRoadmapDraftId,
        coursesState: state.coursesState
      })
    }
  )
);
