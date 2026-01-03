export interface Setting {
    key: string;
    value: string|boolean;
    title: string;
    type: 'string'|'select'|'toggle';
    options?: string[],
}