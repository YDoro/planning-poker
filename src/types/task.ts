export type TaskStatus = 'pending' | 'voting' | 'voted' | 'skipped';

export interface Task {
  id: string;
  title: string;
  description: string;
  score?: string;
  taskCode?: string;
  status: TaskStatus;
  revealed?: boolean;
}
