/** Row shape returned from `public.tasks` */
export interface Task {
  id: string;
  user_id: string | null;
  text: string;
  is_completed: boolean;
  is_starred: boolean;
  created_at: string; // ISO 8601 from Supabase
  updated_at: string;
}

/** Fields allowed when inserting a task */
export interface TaskInsert {
  id?: string;
  user_id?: string | null;
  text: string;
  is_completed?: boolean;
  is_starred?: boolean;
}

/** Fields allowed when updating a task */
export interface TaskUpdate {
  text?: string;
  is_completed?: boolean;
  is_starred?: boolean;
  user_id?: string | null;
}

/** Supabase Database typing (optional, for typed client) */
export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: Task;
        Insert: TaskInsert;
        Update: TaskUpdate;
        Relationships: [
          {
            foreignKeyName: 'tasks_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
  };
}