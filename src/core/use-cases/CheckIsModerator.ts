export interface CheckIsModeratorInput {
  moderatorId: string;
  currentPlayerId?: string;
  isAllowMembersToManageSession?: boolean;
}

export class CheckIsModerator {
  execute(input: CheckIsModeratorInput): boolean {
    if (input.isAllowMembersToManageSession) {
      return true;
    }
    return input.moderatorId === input.currentPlayerId;
  }
}

export const checkIsModerator = new CheckIsModerator();
