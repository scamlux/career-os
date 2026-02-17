import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';

type AuthGrpc = {
  ValidateAccessToken(req: { access_token: string }): Observable<{ valid: boolean; user_id?: string; tenant_id?: string; roles?: string[] }>;
};

type UserProfileGrpc = {
  GetProfile(req: { user_id: string }): Observable<Record<string, unknown>>;
};

type AICoreGrpc = {
  ExecuteFlow(req: { meta: { user_id: string; tenant_id: string }; flow_name: string; flow_version?: string; input_json: string }): Observable<Record<string, unknown>>;
};

type RoadmapGrpc = {
  GetActiveRoadmap(req: { user_id: string }): Observable<Record<string, unknown>>;
};

type LmsGrpc = {
  GetCourse(req: { course_id: string }): Observable<Record<string, unknown>>;
};

type EduTrackerGrpc = {
  GetLearningProgress(req: { user_id: string }): Observable<Record<string, unknown>>;
};

type BillingGrpc = {
  CheckEntitlement(req: { user_id: string; feature_key: string }): Observable<{ allowed: boolean; reason: string }>;
  GetActiveSubscription(req: { user_id: string }): Observable<Record<string, unknown>>;
};

type AnalyticsGrpc = {
  GetKpiSnapshot(req: { tenant_id: string }): Observable<Record<string, unknown>>;
};

@Injectable()
export class GatewayFacade implements OnModuleInit {
  private authService!: AuthGrpc;
  private profileService!: UserProfileGrpc;
  private aiService!: AICoreGrpc;
  private roadmapService!: RoadmapGrpc;
  private lmsService!: LmsGrpc;
  private trackerService!: EduTrackerGrpc;
  private billingService!: BillingGrpc;
  private analyticsService!: AnalyticsGrpc;

  constructor(
    @Inject('AUTH_GRPC') private readonly authClient: ClientGrpc,
    @Inject('USER_PROFILE_GRPC') private readonly profileClient: ClientGrpc,
    @Inject('AI_CORE_GRPC') private readonly aiClient: ClientGrpc,
    @Inject('ROADMAP_GRPC') private readonly roadmapClient: ClientGrpc,
    @Inject('LMS_GRPC') private readonly lmsClient: ClientGrpc,
    @Inject('EDU_TRACKER_GRPC') private readonly trackerClient: ClientGrpc,
    @Inject('BILLING_GRPC') private readonly billingClient: ClientGrpc,
    @Inject('ANALYTICS_GRPC') private readonly analyticsClient: ClientGrpc
  ) {}

  onModuleInit(): void {
    this.authService = this.authClient.getService<AuthGrpc>('AuthService');
    this.profileService = this.profileClient.getService<UserProfileGrpc>('UserProfileService');
    this.aiService = this.aiClient.getService<AICoreGrpc>('AICoreService');
    this.roadmapService = this.roadmapClient.getService<RoadmapGrpc>('RoadmapService');
    this.lmsService = this.lmsClient.getService<LmsGrpc>('LMSService');
    this.trackerService = this.trackerClient.getService<EduTrackerGrpc>('EduTrackerService');
    this.billingService = this.billingClient.getService<BillingGrpc>('SubscriptionBillingService');
    this.analyticsService = this.analyticsClient.getService<AnalyticsGrpc>('AnalyticsService');
  }

  async validateToken(accessToken: string) {
    return firstValueFrom(this.authService.ValidateAccessToken({ access_token: accessToken }));
  }

  async getProfile(userId: string) {
    return firstValueFrom(this.profileService.GetProfile({ user_id: userId }));
  }

  async executeAiFlow(input: {
    userId: string;
    tenantId: string;
    flowName: string;
    flowVersion?: string;
    payload: Record<string, unknown>;
  }) {
    const entitlement = await firstValueFrom(
      this.billingService.CheckEntitlement({
        user_id: input.userId,
        feature_key: 'ai.flow.execute'
      })
    );

    if (!entitlement.allowed) {
      return {
        blocked: true,
        reason: entitlement.reason
      };
    }

    return firstValueFrom(
      this.aiService.ExecuteFlow({
        meta: {
          user_id: input.userId,
          tenant_id: input.tenantId
        },
        flow_name: input.flowName,
        flow_version: input.flowVersion,
        input_json: JSON.stringify(input.payload)
      })
    );
  }

  async getActiveRoadmap(userId: string) {
    return firstValueFrom(this.roadmapService.GetActiveRoadmap({ user_id: userId }));
  }

  async getCourse(courseId: string) {
    return firstValueFrom(this.lmsService.GetCourse({ course_id: courseId }));
  }

  async getLearningProgress(userId: string) {
    return firstValueFrom(this.trackerService.GetLearningProgress({ user_id: userId }));
  }

  async getActiveSubscription(userId: string) {
    return firstValueFrom(this.billingService.GetActiveSubscription({ user_id: userId }));
  }

  async getKpiSnapshot(tenantId: string) {
    return firstValueFrom(this.analyticsService.GetKpiSnapshot({ tenant_id: tenantId }));
  }
}
