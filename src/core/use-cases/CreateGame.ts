import { ulid } from 'ulid';
import { Game, GameType, CardConfig } from '../domain/entities/Game';
import { Player, PlayerStatus } from '../domain/entities/Player';
import { IGameRepository } from '../domain/repositories/IGameRepository';

export interface CreateGameInput {
  name: string;
  createdBy: string;
  gameType: GameType;
  cards: CardConfig[];
  isAllowMembersToManageSession?: boolean;
}

export class CreateGame {
  constructor(private gameRepository: IGameRepository) {}

  async execute(input: CreateGameInput): Promise<{ gameId: string; creatorId: string }> {
    const gameId = ulid();
    const creatorId = ulid();

    const creator = new Player(
      creatorId,
      input.createdBy,
      PlayerStatus.NotStarted
    );

    const game = new Game(
      gameId,
      input.name,
      false, // isFinished
      undefined, // currentTaskId
      [], // tasks
      [creator],
      input.cards,
      input.createdBy,
      creatorId,
      new Date(),
      0, // average
      input.gameType,
      input.isAllowMembersToManageSession
    );

    await this.gameRepository.save(game);
    await this.gameRepository.savePlayer(gameId, creator);

    return { gameId, creatorId };
  }
}
