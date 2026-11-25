const { Router } = require('express');
const { randomUUID } = require('node:crypto');

const router = Router();
const tasks = new Map();

function findTask(req, res, next) {
  req.task = tasks.get(req.params.id);
  if (!req.task) return res.status(404).json({ error: 'Task not found' });
  next();
}

function validateTask(req, res, next) {
  const { title, completed } = req.body ?? {};
  if (typeof title !== 'string' || !title.trim() || title.trim().length > 120) {
    return res.status(400).json({ error: 'Title must contain 1 to 120 characters' });
  }
  if ((req.method === 'PUT' || completed !== undefined) && typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'Completed must be a boolean' });
  }
  req.taskInput = { title: title.trim(), completed: completed ?? false };
  next();
}

router.get('/', (req, res) => res.json([...tasks.values()]));
router.post('/', validateTask, (req, res) => {
  const task = { id: randomUUID(), ...req.taskInput };
  tasks.set(task.id, task);
  res.location('/api/tasks/' + task.id).status(201).json(task);
});
router.get('/:id', findTask, (req, res) => res.json(req.task));
router.put('/:id', findTask, validateTask, (req, res) => {
  const task = { id: req.task.id, ...req.taskInput };
  tasks.set(task.id, task);
  res.json(task);
});
router.delete('/:id', findTask, (req, res) => {
  tasks.delete(req.task.id);
  res.status(204).end();
});

module.exports = router;
