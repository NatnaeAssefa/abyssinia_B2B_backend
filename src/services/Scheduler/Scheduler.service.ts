import cron from 'node-cron';

interface TaskOptions {
  cron?: string;
  interval?: number;
  delay?: number;
  retries?: number;
  retryDelay?: number;
}

interface Task {
  id: string;
  action: () => Promise<void> | void;
  options: TaskOptions;
  retriesLeft: number;
  instance: any;
}

class Scheduler {
  private tasks: Map<string, Task>;

  constructor() {
    this.tasks = new Map<string, Task>();
  }

  /**
   * Add a task to the scheduler.
   * @param id - Unique identifier for the task.
   * @param action - Function to execute for the task.
   * @param options - Configuration options for the task.
   */
  addTask(id: string, action: () => Promise<void> | void, options: TaskOptions = {}): void {
    if (this.tasks.has(id)) {
      throw new Error(`Task with ID "${id}" already exists.`);
    }

    const task: Task = {
      id,
      action,
      options,
      retriesLeft: options.retries || 0,
      instance: null,
    };

    if (options.cron) {
      task.instance = cron.schedule(options.cron, () => this.executeTask(task), { scheduled: true });
    } else if (options.interval) {
      task.instance = setInterval(() => this.executeTask(task), options.interval);
    } else if (options.delay) {
      task.instance = setTimeout(() => {
        this.executeTask(task);
        this.deleteTask(id); // Auto-remove after execution
      }, options.delay);
    } else {
      throw new Error('Task must have a valid scheduling option (cron, interval, or delay).');
    }

    this.tasks.set(id, task);
  }

  /**
   * Execute a task with retry handling.
   * @param task - Task object.
   */
  private async executeTask(task: Task): Promise<void> {
    try {
      await task.action();
    } catch (error) {
      console.error(`Task "${task.id}" failed:`, error);
      if (task.retriesLeft > 0) {
        task.retriesLeft--;
        console.log(`Retrying task "${task.id}" (${task.retriesLeft} retries left)...`);
        setTimeout(() => this.executeTask(task), task.options.retryDelay || 1000);
      } else {
        console.error(`Task "${task.id}" has exhausted all retry attempts.`);
      }
    }
  }

  /**
   * Update an existing task.
   * @param id - Unique identifier for the task.
   * @param newOptions - New configuration options for the task.
   */
  updateTask(id: string, newOptions: Partial<TaskOptions>): void {
    if (!this.tasks.has(id)) {
      throw new Error(`Task with ID "${id}" does not exist.`);
    }

    const task = this.tasks.get(id);
    if (task) {
      this.deleteTask(id); // Remove current task
      this.addTask(id, task.action, { ...task.options, ...newOptions });
    }
  }

  /**
   * Delete a task from the scheduler.
   * @param id - Unique identifier for the task.
   */
  deleteTask(id: string): void {
    const task = this.tasks.get(id);
    if (!task) {
      throw new Error(`Task with ID "${id}" does not exist.`);
    }

    if (task.options.cron && task.instance) {
      task.instance.stop();
    } else if (task.options.interval && task.instance) {
      clearInterval(task.instance);
    } else if (task.options.delay && task.instance) {
      clearTimeout(task.instance);
    }

    this.tasks.delete(id);
  }

  /**
   * List all scheduled tasks.
   * @returns Array of task IDs.
   */
  listTasks(): string[] {
    return Array.from(this.tasks.keys());
  }
}
export default Scheduler;