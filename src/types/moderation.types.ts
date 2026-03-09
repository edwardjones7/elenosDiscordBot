export type ModerationSeverity = 'low' | 'medium' | 'high';

export interface ModerationResult {
  shouldAct: boolean;
  reason?: string;
  severity?: ModerationSeverity;
}

export interface ModerationAction {
  reason: string;
  severity: ModerationSeverity;
  shouldBan?: boolean;
}

export interface Warning {
  id: number;
  guildId: string;
  userId: string;
  moderatorId: string;
  reason: string;
  timestamp: number;
}
