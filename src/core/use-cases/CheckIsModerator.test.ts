import { checkIsModerator } from './CheckIsModerator';

describe('CheckIsModerator', () => {
  it('should return true if the currentPlayerId matches the moderatorId', () => {
    const moderatorId = 'moderator123';
    const currentPlayerId = 'moderator123';
    const isAllowMembersToManageSession = false;

    const result = checkIsModerator.execute({
      moderatorId,
      currentPlayerId,
      isAllowMembersToManageSession,
    });

    expect(result).toBe(true);
  });

  it('should return false if the currentPlayerId does not match the moderatorId', () => {
    const moderatorId = 'moderator123';
    const currentPlayerId = 'player456';
    const isAllowMembersToManageSession = false;

    const result = checkIsModerator.execute({
      moderatorId,
      currentPlayerId,
      isAllowMembersToManageSession,
    });

    expect(result).toBe(false);
  });

  it('should return false if isAllowMembersToManageSession is false', () => {
    const moderatorId = 'moderator123';
    const currentPlayerId = 'player456';
    const isAllowMembersToManageSession = false;

    const result = checkIsModerator.execute({
      moderatorId,
      currentPlayerId,
      isAllowMembersToManageSession,
    });

    expect(result).toBe(false);
  });

  it('should return false if isAllowMembersToManageSession is undefined', () => {
    const moderatorId = 'moderator123';
    const currentPlayerId = 'player456';
    const isAllowMembersToManageSession = undefined;

    const result = checkIsModerator.execute({
      moderatorId,
      currentPlayerId,
      isAllowMembersToManageSession,
    });

    expect(result).toBe(false);
  });

  it('should return true if isAllowMembersToManageSession is true', () => {
    const moderatorId = 'moderator123';
    const currentPlayerId = 'moderator123';
    const isAllowMembersToManageSession = true;

    const result = checkIsModerator.execute({
      moderatorId,
      currentPlayerId,
      isAllowMembersToManageSession,
    });

    expect(result).toBe(true);
  });

  it('should return true if the currentPlayerId is included in moderatorIds', () => {
    const result = checkIsModerator.execute({
      moderatorId: 'moderator123',
      currentPlayerId: 'promoted456',
      isAllowMembersToManageSession: false,
      moderatorIds: ['promoted456'],
    });

    expect(result).toBe(true);
  });

  it('should return false if the currentPlayerId is not in moderatorIds nor the creator', () => {
    const result = checkIsModerator.execute({
      moderatorId: 'moderator123',
      currentPlayerId: 'player789',
      isAllowMembersToManageSession: false,
      moderatorIds: ['promoted456'],
    });

    expect(result).toBe(false);
  });

  it('should return false when moderatorIds is empty and player is not the creator', () => {
    const result = checkIsModerator.execute({
      moderatorId: 'moderator123',
      currentPlayerId: 'player789',
      isAllowMembersToManageSession: false,
      moderatorIds: [],
    });

    expect(result).toBe(false);
  });
});
