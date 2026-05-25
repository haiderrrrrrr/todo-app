const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  task: {
    type: String,
    required: true,
    trim: true,
  },
  done: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const TodoModel = mongoose.model('Task', todoSchema);

module.exports = TodoModel;
