import { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useNavigate, useParams, useBlocker } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { streamGame, streamPlayers } from '../../service/games';
import { getCurrentPlayerId } from '../../service/players';
import { Game } from '../../types/game';
import { Player } from '../../types/player';
import { Loading } from '../Loading/Loading';
import { GameArea } from './GameArea/GameArea';
import { TasksProvider } from '../../context/TasksContext';

export const Poker = () => {
  const { t } = useTranslation();
  let { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | undefined>(undefined);
  const [players, setPlayers] = useState<Player[] | undefined>(undefined);
  const [loading, setIsLoading] = useState(true);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | undefined>(undefined);

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
    let effectCleanup = true;

    if (effectCleanup) {
      const currentPlayerId = getCurrentPlayerId(id as string);
      if (!currentPlayerId) {
        navigate(`/join/${id}`);
      }

      setCurrentPlayerId(currentPlayerId);
      setIsLoading(true);
    }

    streamGame(id as string).onSnapshot((snapshot) => {
      if (effectCleanup) {
        if (snapshot.exists) {
          const data = snapshot.data();
          if (data) {
            setGame(data as Game);
            setIsLoading(false);
            return;
          }
        }
        setIsLoading(false);
      }
    });

    streamPlayers(id as string).onSnapshot((snapshot) => {
      if (effectCleanup) {
        const players: Player[] = [];
        snapshot.forEach((snapshot) => {
          players.push(snapshot.data() as Player);
        });
        const currentPlayerId = getCurrentPlayerId(id as string);
        if (!players.find((player) => player.id === currentPlayerId)) {
          navigate(`/join/${id}`);
        }
        setPlayers(players);
      }
    });

    return () => {
      effectCleanup = false;
    };
  }, [id, navigate]);

  if (loading) {
    return (
      <div className='flex items-center justify-center p-10'>
        <Loading />
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      {game && players && currentPlayerId ? (
        <TasksProvider game={game}>
          <GameArea game={game} players={players} currentPlayerId={currentPlayerId} />
        </TasksProvider>
      ) : (
        <p>{t('Poker.gameNotFound')}</p>
      )}
    </DndProvider>
  );
};

export default Poker;
