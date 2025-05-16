export interface Task {
    id?: string;  
    task_name: string;
    description: string;
    time_spent: number;
    date_created: string;
    completed: boolean;
    category: string;
    priority: "Low" | "Medium" | "High";
  }