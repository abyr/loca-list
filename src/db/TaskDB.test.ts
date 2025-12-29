import { TaskDB } from './TaskDB';
import { Task } from '../models/Task';

const expectedKeys = [
      'id',
      'title',
      'description',
      'createdDate',
      'updatedDate',
      'completed',
      'deleted',
      'starred',
    ];

describe('TaskDB (with full Task model)', () => {
  let db: TaskDB;

  const makeTask = (title = 'Sample task'): Task => ({
    title,
    description: '',
    createdDate: 0,
    updatedDate: 0,
    completed: false,
    starred: false,
    deleted: false,
  });

  beforeEach(async () => {
    db = new TaskDB();
    await await new Promise(res => setTimeout(res, 100));
  });

  test('adds a task and returns its generated id', async () => {
    const id = await db.addTask(makeTask('Add test'));
    expect(typeof id).toBe('number');
    expect(id).toBeGreaterThan(0);
  });

  test('retrieves all tasks after several inserts', async () => {
    await db.addTask(makeTask('First'));
    await db.addTask(makeTask('Second'));

    const tasks = await db.getAllTasks();
    expect(tasks).toHaveLength(2);
    const titles = tasks.map(t => t.title);
    expect(titles).toEqual(expect.arrayContaining(['First', 'Second']));
  });

  test('updates a task and persists the change', async () => {
    await db.addTask(makeTask('To be updated'));

    const [stored] = await db.getAllTasks();
    const updated: Task = { ...stored, completed: true };

    await db.updateTask(updated);

    const [after] = await db.getAllTasks();
    expect(after.completed).toBe(true);
    // `updatedDate` should be newer than the original `createdDate`
    expect(after.updatedDate).toBeGreaterThan(stored.createdDate);
  });

  test('deletes a task and removes it from the store', async () => {
    const id = await db.addTask(makeTask('Will be deleted'));
    await db.deleteTask(id);

    const tasks = await db.getAllTasks();
    expect(tasks).toHaveLength(0);
  });

  test('stored task has exactly the interface properties', async () => {
    const id = await db.addTask(makeTask('Integrity test'));

    const tasks = await db.getAllTasks();
    const stored = tasks.find(t => t.id === id);
    expect(stored).toBeDefined();

    const actualKeys = Object.keys(stored!);
    expect(actualKeys.sort()).toEqual(expectedKeys.sort());

    expect(typeof stored!.id).toBe('number');
    expect(typeof stored!.title).toBe('string');
    expect(typeof stored!.description).toBe('string');
    expect(typeof stored!.createdDate).toBe('number');
    expect(typeof stored!.updatedDate).toBe('number');
    expect(typeof stored!.completed).toBe('boolean');
    expect(typeof stored!.deleted).toBe('boolean');
    expect(typeof stored!.starred).toBe('boolean');
  });

});
