import React, { createContext, useContext, useMemo } from 'react';
import { Game } from '../types/game';
import { Task } from '../types/task';
import { revealCurrentTaskCards, setTaskVoted } from '../service/tasks';

interface TasksContextType {
  currentTask: Task | undefined;
  revealCurrentTask: () => Promise<void>;
  setTaskVoted: () => Promise<void>;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider: React.FC<{ game: Game; children: React.ReactNode }> = ({ game, children }) => {
  const currentTask = useMemo(() => {
    const taskInList = game.tasks?.find((t) => t.id === game.currentTaskId);
    const rootCurrentTask = (game as any).currentTask as Task | undefined;

    if (rootCurrentTask && rootCurrentTask.id === game.currentTaskId) {
      return {
        ...taskInList,
        ...rootCurrentTask,
      } as Task;
    }

    return taskInList;
  }, [game, game.tasks, game.currentTaskId]);

  const handleRevealCurrentTask = async () => {
    await revealCurrentTaskCards(game.id);
  };

  const handleSetTaskVoted = async () => {
    await setTaskVoted(game.id);
  };

  const value = useMemo(
    () => ({
      currentTask,
      revealCurrentTask: handleRevealCurrentTask,
      setTaskVoted: handleSetTaskVoted,
    }),
    [currentTask, game.id]
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};

export const useTasks = () => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
};
