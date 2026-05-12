import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { animals, colors, Config, starWars, uniqueNamesGenerator } from 'unique-names-generator';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { addNewGame } from '../../../service/games';
import { GameType, NewGame } from '../../../types/game';
import { getCards, getCustomCards } from '../../Players/CardPicker/CardConfigs';
import { Card, CardContent, CardFooter, CardHeader } from '@ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select';
import { Input } from '@ui/input';
import { Checkbox } from '@ui/checkbox';
import { Button } from '@ui/button';
import { Label } from '@ui/label';
import { H3 } from '../../Typography';

const gameNameConfig: Config = {
  dictionaries: [colors, animals],
  separator: ' ',
  style: 'capital',
};
const userNameConfig: Config = {
  dictionaries: [starWars],
};

export const CreateGame = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [hasDefaults, setHasDefaults] = useState({ game: true, name: true });

  const formSchema = z.object({
    gameName: z.string().min(1, t('CreateGame.gameNameRequired')),
    createdBy: z.string().min(1, t('CreateGame.createdByRequired')),
    gameType: z.nativeEnum(GameType),
    allowMembersToManageSession: z.boolean().default(false),
    customOptions: z.array(z.string()).length(15),
  }).refine((data) => {
    if (data.gameType === GameType.Custom) {
      const count = data.customOptions.filter(opt => opt && opt.trim() !== '').length;
      return count >= 2;
    }
    return true;
  }, {
    message: t('CreateGame.pleaseEnterValues'),
    path: ['customOptions'],
  });

  type FormValues = z.input<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gameName: uniqueNamesGenerator(gameNameConfig),
      createdBy: localStorage.getItem('recentPlayerName') || uniqueNamesGenerator(userNameConfig),
      gameType: GameType.Fibonacci,
      allowMembersToManageSession: false,
      customOptions: Array(15).fill(''),
    },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = form;
  const gameType = watch('gameType');
  const customOptions = watch('customOptions');

  const onSubmit = async (values: FormValues) => {
    const game: NewGame = {
      name: values.gameName,
      createdBy: values.createdBy,
      gameType: values.gameType,
      isAllowMembersToManageSession: values.allowMembersToManageSession,
      cards: values.gameType === GameType.Custom ? getCustomCards(values.customOptions) : getCards(values.gameType),
      createdAt: new Date(),
    };
    const newGameId = await addNewGame(game);
    if (newGameId) {
      localStorage.setItem('recentPlayerName', values.createdBy);
    }
    navigate(`/game/${newGameId}`);
  };

  const emptyGameName = () => {
    if (hasDefaults.game) {
      setValue('gameName', '');
      setHasDefaults(prev => ({ ...prev, game: false }));
    }
  };
  const emptyCreatorName = () => {
    if (hasDefaults.name) {
      setValue('createdBy', '');
      setHasDefaults(prev => ({ ...prev, name: false }));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className='p-4 h-96'>
        <CardHeader>
          <H3>{t('CreateGame.newSessionHeader')}</H3>
        </CardHeader>
        <CardContent className='flex flex-col gap-4'>
          <div className='space-y-1'>
            <Label htmlFor="gameName">{t('CreateGame.sessionNameLabel')}</Label>
            <Input
              id="gameName"
              placeholder={t('CreateGame.sessionNamePlaceholder')}
              {...register('gameName')}
              onClick={emptyGameName}
              className={errors.gameName ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {errors.gameName && <p className="text-xs text-destructive">{errors.gameName.message}</p>}
          </div>
          <div className='space-y-1'>
            <Label htmlFor="createdBy">{t('CreateGame.yourNameLabel')}</Label>
            <Input
              id="createdBy"
              placeholder={t('CreateGame.yourNamePlaceholder')}
              {...register('createdBy')}
              onClick={emptyCreatorName}
              className={errors.createdBy ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {errors.createdBy && <p className="text-xs text-destructive">{errors.createdBy.message}</p>}
          </div>
          <div className='space-y-1'>
            <Label>{t('CreateGame.sessionSizingType')}</Label>
            <Select
              value={gameType}
              onValueChange={(value) => setValue('gameType', value as GameType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('CreateGame.sessionSizingType')} />
              </SelectTrigger>
              <SelectContent>
                {[
                  { type: GameType.Fibonacci, label: t('CreateGame.fibonacci') },
                  { type: GameType.ShortFibonacci, label: t('CreateGame.shortFibonacci') },
                  { type: GameType.TShirt, label: t('CreateGame.tShirt') },
                  { type: GameType.TShirtAndNumber, label: t('CreateGame.tShirtAndNumber') },
                  { type: GameType.Custom, label: t('CreateGame.custom') },
                ].map(({ type, label }) => (
                  <SelectItem key={type} value={type}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {gameType === GameType.Custom && (
            <div className='space-y-2'>
              <div className='flex flex-wrap gap-2'>
                {customOptions.map((_: string, index: number) => (
                  <Input
                    key={index}
                    maxLength={3}
                    className='w-12 h-8 px-2 py-1 text-xs text-center'
                    {...register(`customOptions.${index}`)}
                    data-testid={`custom-option-${index}`}
                  />
                ))}
              </div>
              {errors.customOptions && (
                <p className='text-destructive text-xs mt-1'>{t('CreateGame.pleaseEnterValues')}</p>
              )}
            </div>
          )}
          <div className='flex items-center space-x-2 mt-2'>
            <Checkbox
              id="allowMembersToManageSession"
              checked={watch('allowMembersToManageSession')}
              onCheckedChange={(checked) => setValue('allowMembersToManageSession', !!checked)}
            />
            <Label htmlFor="allowMembersToManageSession" className='font-normal cursor-pointer'>
              {t('CreateGame.allowMembersToManageSession')}
            </Label>
          </div>
        </CardContent>
        <CardFooter className='mt-auto flex justify-end'>
          <Button
            type='submit'
            className='px-6'
            disabled={isSubmitting}
            data-testid='loading'
          >
            {isSubmitting ? t('CreateGame.creating') : t('CreateGame.create')}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

