export interface TaskTimeEntry {
    id?: number;
    taskId: number;
    started: number;
    stopped?: number;
}