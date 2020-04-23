const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');
const router = new express.Router();

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id,
    });

    try {
        await task.save();
        res.status(201).send(task);
    } catch (err) {
        res.status(400).send(err);
    }
});

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=20
// GET /tasks?sortBy=createdAt_asc
router.get('/tasks', auth, async (req, res) => {
    const match = {};
    const sort = {};

    if (req.query.completed) {
        match.completed = req.query.completed === 'true';
    }

    if (req.query.sortBy) {
        const tokens = req.query.sortBy.split('_');
        sort[tokens[0]] = tokens[1] === 'desc' ? -1 : 1;
    }

    try {
        await req.user
            .populate({
                path: 'tasks',
                match,
                options: {
                    limit: parseInt(req.query.limit),
                    skip: parseInt(req.query.skip),
                    sort,
                },
            })
            .execPopulate();
        res.send(req.user.tasks);

        // const tasks = await Task.find({ owner: req.user._id });
        // res.send(tasks);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.get('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
        if (!task) {
            res.status(400).send();
        }
        res.send(task);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
    if (!isValidOperation) {
        res.status(400).send({ error: 'Invalid updates  !' });
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
        if (!task) {
            res.status(400).send({ error: 'Unable to find task' });
        }

        updates.forEach((update) => {
            task[update] = req.body[update];
        });
        await task.save();

        res.send(task);
    } catch (err) {
        res.status(400).send(err);
    }
});

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

        if (!task) {
            res.status(400).send({ error: 'Task not found!' });
        }

        res.send(task);
    } catch (err) {
        res.status(500).send(err);
    }
});

module.exports = router;
