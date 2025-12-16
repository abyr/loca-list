export interface Task {
    id?: number;
    title: string;
    description: string;
    createdDate: number;
    updatedDate: number;
    completed: boolean;
    starred: boolean;
    deleted: boolean;
    dueDate?: number;
    context?: string;
    projectId?: number;
    priority?: '' | 'low' | 'medium' | 'high';
}
