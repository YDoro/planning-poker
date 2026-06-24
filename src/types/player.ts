import { Status } from './status';

export interface Player {
  name: string;
  id: string;
  status: Status;
  value?: number;
  isNonVoter?: boolean;
}

export interface PlayerGame {
  id: string;
  name: string;
  isAllowMembersToManageSession?: boolean;
  createdById: string;
  createdBy: string;
  playerId: string;
}
