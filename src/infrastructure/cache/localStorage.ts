import { PlayerGame } from '../../types/player';

const playerGamesStoreName = 'playerGames';

export const getPlayerGamesFromCache = (): PlayerGame[] => {
  let playerGames: PlayerGame[] = [];

  const store = localStorage.getItem(playerGamesStoreName);
  if (store) {
    playerGames = JSON.parse(store);
  }
  return playerGames;
};

export const isGameInPlayerCache = (gameId: string): boolean => {
  const playerGames = getPlayerGamesFromCache();
  const found = playerGames.find((playerGames) => playerGames.id === gameId);
  if (found) {
    return true;
  }
  return found ? true : false;
};

export const updatePlayerGamesInCache = (playerGames: PlayerGame[]) => {
  localStorage.setItem(playerGamesStoreName, JSON.stringify(playerGames));
};

export const getCurrentPlayerId = (gameId: string): string | undefined => {
  const playerGames = getPlayerGamesFromCache();
  const game = playerGames.find((playerGame) => playerGame.id === gameId);
  return game && game.playerId;
};

export const removeGameFromCache = (gameId: string): void => {
  const playerGames = getPlayerGamesFromCache();
  updatePlayerGamesInCache(playerGames.filter((playerGame) => playerGame.id !== gameId));
};

export const getPlayerRecentGames = async (): Promise<PlayerGame[]> => {
  return getPlayerGamesFromCache();
};

export const updatePlayerGames = (
  gameId: string,
  gameName: string,
  createdBy: string,
  createdById: string,
  playerId: string
) => {
  const playerGames = getPlayerGamesFromCache();
  playerGames.push({ id: gameId, name: gameName, createdById, createdBy, playerId });
  updatePlayerGamesInCache(playerGames);
};
