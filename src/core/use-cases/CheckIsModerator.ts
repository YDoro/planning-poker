import { isPlayerModerator } from '../domain/entities/Game';

export interface CheckIsModeratorInput {
  moderatorId: string;
  currentPlayerId?: string;
  isAllowMembersToManageSession?: boolean;
  moderatorIds?: string[];
}

/**
 * Flat-data variant of the moderator check, for call sites that only have
 * cached game fields (e.g. RecentGames) rather than a full Game entity.
 * Delegates to the canonical domain rule so behavior stays in sync with
 * Game.isModerator().
 */
export class CheckIsModerator {
  execute(input: CheckIsModeratorInput): boolean {
    return isPlayerModerator({
      createdById: input.moderatorId,
      playerId: input.currentPlayerId,
      moderatorIds: input.moderatorIds,
      isAllowMembersToManageSession: input.isAllowMembersToManageSession,
    });
  }
}

export const checkIsModerator = new CheckIsModerator();
