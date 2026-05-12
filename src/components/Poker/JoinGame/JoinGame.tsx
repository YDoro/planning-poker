import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getGame } from '../../../service/games';
import { addPlayerToGame, isCurrentPlayerInGame } from '../../../service/players';
import { Input } from '@ui/input';
import { Button } from '@ui/button';
import { Label } from '@ui/label';
import { H3 } from '../../Typography';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';

const joinSchema = z.object({
  joinGameId: z.string().min(1, 'Session ID is required'),
  playerName: z.string().min(1, 'Your name is required'),
});

type JoinValues = z.infer<typeof joinSchema>;

type JoinGameProps = {
  open: boolean;
  onClose: (open: boolean) => void;
}

export const JoinGame = ({ open, onClose }: JoinGameProps) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();


  const [gameFound, setGameFound] = useState(true);
  const [showNotExistMessage, setShowNotExistMessage] = useState(false);

  const form = useForm<JoinValues>({
    resolver: zodResolver(joinSchema),
    defaultValues: {
      joinGameId: id || '',
      playerName: localStorage.getItem('recentPlayerName') || '',
    },
  });

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = form;
  const watchedJoinGameId = watch('joinGameId');

  useEffect(() => {
    async function fetchData() {
      if (watchedJoinGameId) {
        if (await getGame(watchedJoinGameId)) {
          setGameFound(true);
          if (await isCurrentPlayerInGame(watchedJoinGameId)) {
            navigate(`/game/${watchedJoinGameId}`);
          }
        } else {
          // If it was already in the URL and not found
          if (watchedJoinGameId === id) {
            setShowNotExistMessage(true);
            setTimeout(() => {
              navigate('/');
            }, 5000);
          } else {
            setGameFound(false);
          }
        }
      }
    }
    fetchData();
  }, [watchedJoinGameId, navigate, id]);

  const onSubmit = async (values: JoinValues) => {
    localStorage.setItem('recentPlayerName', values.playerName);
    const res = await addPlayerToGame(values.joinGameId, values.playerName);

    setGameFound(res);
    if (res) {
      navigate(`/game/${values.joinGameId}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => onClose(value)} >
      <DialogContent className='p-4 min-h-96'>
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col h-full'>
          <DialogHeader>
            <DialogTitle asChild><H3>{t('JoinGame.cardHeader')}</H3></DialogTitle>
          </DialogHeader>
          <div className='flex flex-col gap-4'>
            <div className='space-y-1'>
              <Label htmlFor='joinGameId'>{t('JoinGame.sessionIdLabel')}</Label>
              <Input
                id='joinGameId'
                placeholder={t('JoinGame.sessionIdPlaceholder')}
                {...register('joinGameId')}
                className={!gameFound || errors.joinGameId ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {!gameFound && (
                <p className='text-destructive text-xs mt-1'>{t('JoinGame.sessionNotFound')}</p>
              )}
              {errors.joinGameId && (
                <p className='text-destructive text-xs mt-1'>{errors.joinGameId.message}</p>
              )}
            </div>
            <div className='space-y-1'>
              <Label htmlFor='playerName'>{t('JoinGame.playerNameLabel')}</Label>
              <Input
                id='playerName'
                placeholder={t('JoinGame.playerNamePlaceholder')}
                {...register('playerName')}
                className={errors.playerName ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {errors.playerName && (
                <p className='text-destructive text-xs mt-1'>{errors.playerName.message}</p>
              )}
            </div>
          </div>
          <DialogFooter className='mt-auto flex justify-end'>
            <Button
              type='submit'
              className='px-6'
              disabled={isSubmitting}
            >
              {isSubmitting ? t('JoinGame.joinging') : t('JoinGame.joinGameButton')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      {showNotExistMessage && (
        <div className='fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4'>
          <div
            className='bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm'
            role='alert'
          >
            <span className='block font-bold text-sm'>{t('JoinGame.sessionDeleted')}</span>
          </div>
        </div>
      )}
    </Dialog>
  );
};

