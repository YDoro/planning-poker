import React, { useState, useRef, useCallback } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Task } from '../../../core/domain/entities/Task';
import { Game } from '../../../core/domain/entities/Game';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Plus, Trash2, Pencil, Check, X, Play, GripVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../../presentation/stores/useGameStore';

interface TaskListProps {
  game: Game;
  isModerator: boolean;
  fullWidth?: boolean;
}

const ItemTypes = {
  TASK: 'task',
};

interface DraggableTaskItemProps {
  task: Task;
  index: number;
  gameId: string;
  isCurrent: boolean;
  isEditing: boolean;
  editTitle: string;
  isModerator: boolean;
  moveTask: (dragIndex: number, hoverIndex: number) => void;
  onDrop: () => void;
  setEditTitle: (title: string) => void;
  handleEditTask: (id: string) => void;
  handleCancelEdit: () => void;
  setEditingId: (id: string | null) => void;
}

const DraggableTaskItem: React.FC<DraggableTaskItemProps> = ({
  task,
  index,
  gameId,
  isCurrent,
  isEditing,
  editTitle,
  isModerator,
  moveTask,
  onDrop,
  setEditTitle,
  handleEditTask,
  handleCancelEdit,
  setEditingId,
}) => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const changeCurrentTaskStore = useGameStore((state) => state.changeCurrentTask);
  const deleteTaskStore = useGameStore((state) => state.deleteTask);

  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.TASK,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: any, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset as any).y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveTask(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    drop() {
      onDrop();
    }
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.TASK,
    item: () => {
      return { id: task.id, index };
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));
  const setPreviewRef = useCallback((node: HTMLDivElement | null) => {
    preview(node);
  }, [preview]);

  return (
    <div
      ref={setPreviewRef}
      style={{ opacity: isDragging ? 0.4 : 1 }}
      className={`flex flex-col p-3 rounded-lg border text-sm transition-colors ${isCurrent ? 'bg-primary/10 border-primary' : 'bg-background hover:bg-secondary/50'
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
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {isModerator && (
              <div ref={ref} className="cursor-grab hover:bg-secondary rounded p-1" title={t('GameController.tasks.dragToReorder', 'Drag to reorder')}>
                <GripVertical size={16} className="text-muted-foreground" />
              </div>
            )}
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
          </div>

          {isModerator && (
            <div className="flex gap-1 opacity-0 hover:opacity-100 transition-opacity" style={{ opacity: 1 /* Force visible on touch or just always visible for now */ }}>
              {!isCurrent && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  title={t('GameController.tasks.play', 'Vote on this task')}
                  onClick={() => changeCurrentTaskStore(gameId, task.id)}
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
                onClick={() => deleteTaskStore(gameId, task.id)}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const TaskList: React.FC<TaskListProps> = ({ game, isModerator, fullWidth = false }) => {
  const { t } = useTranslation();
  const addTaskStore = useGameStore((state) => state.addTask);
  const editTaskStore = useGameStore((state) => state.editTask);
  const reorderTasksStore = useGameStore((state) => state.reorderTasks);

  const tasks = game.tasks || [];
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const [localTasks, setLocalTasks] = useState<Task[]>([]);

  React.useEffect(() => {
    setLocalTasks(game.tasks || []);
  }, [game.tasks]);

  const handleAddTask = async () => {
    if (newTaskTitle.trim()) {
      await addTaskStore(game.id, { title: newTaskTitle, description: '' });
      setNewTaskTitle('');
      setIsAdding(false);
    }
  };

  const handleEditTask = async (id: string) => {
    if (editTitle.trim()) {
      await editTaskStore(game.id, id, { title: editTitle });
      setEditingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const moveTask = useCallback((dragIndex: number, hoverIndex: number) => {
    setLocalTasks((prevTasks) => {
      const newTasks = [...prevTasks];
      const draggedTask = newTasks[dragIndex];
      newTasks.splice(dragIndex, 1);
      newTasks.splice(hoverIndex, 0, draggedTask);
      return newTasks;
    });
  }, []);

  const handleDrop = async () => {
    await reorderTasksStore(game.id, localTasks);
  };

  return (
    <Card className={`flex flex-col h-full p-4 gap-4 bg-card overflow-hidden flex-5 ${fullWidth ? 'w-full' : 'w-full md:w-80'}`}>
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">{t('GameController.tasks.title', 'Tasks')}</h3>
        {isModerator && (
          <Button variant="ghost" size="icon" onClick={() => setIsAdding(true)} title={t('GameController.tasks.add', 'Add Task')}>
            <Plus size={20} className='size-7 md:size-5' />
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
            <Button variant="ghost" size="icon" className="h-8 w-8 text-green-700" onClick={handleAddTask}>
              <Check size={16} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setIsAdding(false)}>
              <X size={16} />
            </Button>
          </div>
        )}

        {localTasks.length === 0 && !isAdding && (
          <p className="text-sm text-muted-foreground text-center py-4">{t('GameController.tasks.empty', 'No tasks yet')}</p>
        )}

        {localTasks.map((task, index) => (
          <DraggableTaskItem
            key={task.id}
            task={task}
            index={index}
            gameId={game.id}
            isCurrent={game.currentTaskId === task.id}
            isEditing={editingId === task.id}
            editTitle={editTitle}
            isModerator={isModerator}
            moveTask={moveTask}
            onDrop={handleDrop}
            setEditTitle={setEditTitle}
            handleEditTask={handleEditTask}
            handleCancelEdit={handleCancelEdit}
            setEditingId={setEditingId}
          />
        ))}
      </div>
    </Card>
  );
};
