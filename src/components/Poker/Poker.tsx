import { useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useNavigate, useParams, useBlocker } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCurrentPlayerId } from '../../infrastructure/cache/localStorage';
import { Loading } from '../Loading/Loading';
import { GameArea } from './GameArea/GameArea';
import { useGameStore } from '../../presentation/stores/useGameStore';

export const Poker = () => {
  const { t } = useTranslation();
  let { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const players = useGameStore((state) => state.players);
  const game = useGameStore((state) => state.game);
  const isLoading = useGameStore((state) => state.isLoading);
  const connectToGame = useGameStore((state) => state.connectToGame);

  const currentPlayerId = id ? getCurrentPlayerId(id) : undefined;

  useBlocker(({ historyAction }) => {
    if (historyAction === 'POP') {
      // Detect back navigation
      const confirmLeave = window.confirm(t('Poker.leaveBackConfirm'));
      if (!confirmLeave) {
        return true; // Prevent navigation
      }
    }
    return false; // Allow navigation
  });

  useEffect(() => {
    if (!id) return;
    const currentId = getCurrentPlayerId(id);
    if (!currentId) {
      navigate(`/join/${id}`);
      return;
    }

    const disconnect = connectToGame(id);
    return () => {
      disconnect();
    };
  }, [id, connectToGame, navigate]);

  useEffect(() => {
    if (!isLoading && players.length > 0 && id) {
      const currentId = getCurrentPlayerId(id);
      if (currentId && !players.find((player) => player.id === currentId)) {
        navigate(`/join/${id}`);
      }
    }
  }, [isLoading, players, id, navigate]);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-10'>
        <Loading />
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      {game && players && currentPlayerId ? (
        <GameArea game={game} players={players} currentPlayerId={currentPlayerId} />
      ) : (
        <p>{t('Poker.gameNotFound')}</p>
      )}
    </DndProvider>
  );
};

export default Poker;
