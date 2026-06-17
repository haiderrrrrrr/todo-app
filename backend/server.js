require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const TodoModel = require('./models/Todo');

const app = express();
const allowedOrigin = process.env.CLIENT_ORIGIN;
const corsOptions = allowedOrigin ? { origin: allowedOrigin } : {};
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/todo';
const port = process.env.PORT || 5000;
let connectionPromise;

app.use(cors(corsOptions));
app.use(express.json());

const isValidObjectId = id => mongoose.Types.ObjectId.isValid(id);

const sendServerError = (res, err) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
};

const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(mongoUri)
      .then(() => console.log('MongoDB connected'))
      .catch(err => {
        connectionPromise = null;
        throw err;
      });
  }

  await connectionPromise;
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', async (req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (err) {
    sendServerError(res, err);
  }
});

app.post('/api/add', async (req, res) => {
  const task = req.body.task?.trim();

  if (!task) {
    return res.status(400).json({ error: 'Task is required' });
  }

  try {
    const result = await TodoModel.create({ task });
    return res.status(201).json(result);
  } catch (err) {
    return sendServerError(res, err);
  }
});

app.get('/api/get', async (req, res) => {
  try {
    const result = await TodoModel.find().sort({ createdAt: -1 });
    return res.json(result);
  } catch (err) {
    return sendServerError(res, err);
  }
});

app.put('/api/edit/:id', async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid todo id' });
  }

  try {
    const todo = await TodoModel.findById(id);

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    todo.done = typeof req.body.done === 'boolean' ? req.body.done : !todo.done;
    const result = await todo.save();
    return res.json(result);
  } catch (err) {
    return sendServerError(res, err);
  }
});

app.put('/api/update/:id', async (req, res) => {
  const { id } = req.params;
  const task = req.body.task?.trim();

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid todo id' });
  }

  if (!task) {
    return res.status(400).json({ error: 'Task is required' });
  }

  try {
    const result = await TodoModel.findByIdAndUpdate(id, { task }, { new: true });

    if (!result) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    return res.json(result);
  } catch (err) {
    return sendServerError(res, err);
  }
});

app.delete('/api/delete/:id', async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid todo id' });
  }

  try {
    const result = await TodoModel.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    return res.json(result);
  } catch (err) {
    return sendServerError(res, err);
  }
});

const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
