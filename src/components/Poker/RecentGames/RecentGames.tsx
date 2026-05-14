import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { removeGame } from '../../../service/games';
import { getCurrentPlayerId, getPlayerRecentGames } from '../../../service/players';
import { PlayerGame } from '../../../types/player';
import { isModerator } from '../../../utils/isModerator';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { useTranslation } from 'react-i18next';
import { Button } from '../../ui/button';
import { Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../ui/alert-dialog';

export const RecentGames = () => {
  const navigate = useNavigate();
  const [recentGames, setRecentGames] = useState<PlayerGame[] | undefined>(undefined);
  const [reloadRecent, setReloadRecent] = useState<Boolean>(false);
  const { t } = useTranslation();
  useEffect(() => {
    let fetchCleanup = true;

    async function fetchRecent() {
      const games = await getPlayerRecentGames();
      if (games && fetchCleanup) {
        setRecentGames(games);
      }
    }

    fetchRecent();

    return () => {
      fetchCleanup = false;
    };
  }, [reloadRecent]);

  const isEmptyRecentGames = (): boolean => {
    if (!recentGames) {
      return true;
    }
    if (recentGames && recentGames.length === 0) {
      return true;
    }
    return false;
  };

  const handleRemoveGame = async (recentGameId: string) => {
    await removeGame(recentGameId);
    setReloadRecent(!reloadRecent);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('toolbar.history.title')}</CardTitle>
      </CardHeader>
      <CardContent className='min-w-xs max-w-xs max-h-3/4 overflow-y-auto'>
        {isEmptyRecentGames() && <p className='text-sm'>{t('toolbar.history.noGames')}</p>}
        {recentGames && recentGames.length > 0 && (
          <div className='w-full flex flex-col'>
            {recentGames.map(
              (recentGame) =>
                recentGame.name && (
                  <div
                    key={recentGame.id}
                    className='flex flex-row items-center hover:bg-muted/50 rounded-lg transition-colors overflow-hidden'
                  >
                    <Link
                      to={`/game/${recentGame.id}`}
                      className='flex-1 text-left px-3 py-2 overflow-hidden text-ellipsis text-sm font-medium whitespace-nowrap'
                    >
                      {recentGame.name}
                    </Link>

                    {isModerator(
                      recentGame.createdById,
                      getCurrentPlayerId(recentGame.id),
                      recentGame.isAllowMembersToManageSession,
                    ) && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={(e) => e.stopPropagation()}
                              aria-label={t('toolbar.history.deleteSession')}
                            >
                              <Trash2
                                className='text-destructive'
                              />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {t('toolbar.history.deletionDialog.title')}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('toolbar.history.deletionDialog.description')}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                {t('toolbar.history.deletionDialog.cancelButton')}
                              </AlertDialogCancel>
                              <AlertDialogAction variant='destructive' onClick={() => handleRemoveGame(recentGame.id)}>
                                {t('toolbar.history.deletionDialog.continueButton')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                  </div>
                ),
            )}
          </div>
        )}
      </CardContent>
    </Card >
  );
};
