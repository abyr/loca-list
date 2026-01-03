import taskDAO from './TaskDAO';
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
  const db = taskDAO;

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
    // clear existing tasks to ensure test isolation
    const all = await db.getAllTasks();
    await Promise.all(all.map(t => (t.id ? db.deleteTask(t.id) : Promise.resolve())));
  });

  test('adds a task and returns its generated id', async () => {
    const id = await db.createTask(makeTask('Add test'));
    expect(typeof id).toBe('number');
    expect(id).toBeGreaterThan(0);
  });

  test('retrieves all tasks after several inserts', async () => {
    await db.createTask(makeTask('First'));
    await db.createTask(makeTask('Second'));

    const tasks = await db.getAllTasks();
    expect(tasks).toHaveLength(2);
    const titles = tasks.map(t => t.title);
    expect(titles).toEqual(expect.arrayContaining(['First', 'Second']));
  });

  test('updates a task and persists the change', async () => {
    await db.createTask(makeTask('To be updated'));

    const [stored] = await db.getAllTasks();
    const updated: Task = { ...stored, completed: true };

    await db.updateTask(updated);

    const [after] = await db.getAllTasks();
    expect(after.completed).toBe(true);
    // `updatedDate` should be newer than the original `createdDate`
    expect(after.updatedDate).toBeGreaterThan(stored.createdDate);
  });

  test('deletes a task and removes it from the store', async () => {
    const id = await db.createTask(makeTask('Will be deleted'));
    await db.deleteTask(id);

    const tasks = await db.getAllTasks();
    expect(tasks).toHaveLength(0);
  });

  test('stored task has exactly the interface properties', async () => {
    const id = await db.createTask(makeTask('Integrity test'));

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
