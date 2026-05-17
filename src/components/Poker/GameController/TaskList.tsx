import React, { useState } from 'react';
import { Task } from '../../../types/task';
import { Game } from '../../../types/game';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Plus, Trash2, Pencil, Check, X, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { addTask, deleteTask, editTask, changeCurrentTask } from '../../../service/games';

interface TaskListProps {
  game: Game;
  isModerator: boolean;
}

export const TaskList: React.FC<TaskListProps> = ({ game, isModerator }) => {
  const { t } = useTranslation();
  const tasks = game.tasks || [];
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleAddTask = async () => {
    if (newTaskTitle.trim()) {
      await addTask(game.id, { title: newTaskTitle, description: '', status: 'pending' });
      setNewTaskTitle('');
      setIsAdding(false);
    }
  };

  const handleEditTask = async (id: string) => {
    if (editTitle.trim()) {
      await editTask(game.id, id, { title: editTitle });
      setEditingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  return (
    <Card className="flex flex-col w-full md:w-80 h-full p-4 gap-4 bg-card/50 overflow-hidden">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">{t('GameController.tasks.title', 'Tasks')}</h3>
        {isModerator && (
          <Button variant="ghost" size="icon" onClick={() => setIsAdding(true)} title={t('GameController.tasks.add', 'Add Task')}>
            <Plus size={20} />
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2 overflow-y-auto pr-2">
        {isAdding && (
          <div className="flex items-center gap-2 mb-2">
            <Input
              autoFocus
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              placeholder={t('GameController.tasks.newTaskPlaceholder', 'Task title...')}
              className="text-sm h-8"
            />
            <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={handleAddTask}>
              <Check size={16} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setIsAdding(false)}>
              <X size={16} />
            </Button>
          </div>
        )}

        {tasks.length === 0 && !isAdding && (
          <p className="text-sm text-muted-foreground text-center py-4">{t('GameController.tasks.empty', 'No tasks yet')}</p>
        )}

        {tasks.map((task) => {
          const isCurrent = game.currentTaskId === task.id;
          const isEditing = editingId === task.id;

          return (
            <div
              key={task.id}
              className={`flex flex-col p-3 rounded-lg border text-sm transition-colors ${
                isCurrent ? 'bg-primary/10 border-primary' : 'bg-background hover:bg-secondary/50'
              }`}
            >
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    autoFocus
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleEditTask(task.id)}
                    className="text-sm h-8"
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => handleEditTask(task.id)}>
                    <Check size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={handleCancelEdit}>
                    <X size={16} />
                  </Button>
                </div>
              ) : (
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <span className="font-medium truncate" title={task.title}>
                      {task.title}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="capitalize">{t(`GameController.tasks.status.${task.status}`, task.status)}</span>
                      {task.score && (
                        <>
                          <span>•</span>
                          <span className="font-semibold text-primary">{t('GameController.tasks.score', 'Score:')} {task.score}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {isModerator && (
                    <div className="flex gap-1 opacity-0 hover:opacity-100 transition-opacity" style={{ opacity: 1 /* Force visible on touch or just always visible for now */ }}>
                      {!isCurrent && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          title={t('GameController.tasks.play', 'Vote on this task')}
                          onClick={() => changeCurrentTask(game.id, task.id)}
                        >
                          <Play size={14} />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          setEditingId(task.id);
                          setEditTitle(task.title);
                        }}
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => deleteTask(game.id, task.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
