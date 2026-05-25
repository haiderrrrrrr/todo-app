import React, { useState } from 'react';
import './App.css';

const Create = ({ onTodoCreated, onError }) => {
  const [task, setTask]             = useState('');
  const [isSubmitting, setSubmitting] = useState(false);

  const createTask = async e => {
    e.preventDefault();
    const trimmed = task.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: trimmed }),
      });
      if (!res.ok) throw new Error();
      onTodoCreated(await res.json());
      setTask('');
    } catch {
      onError('Could not create the task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="todo-header">
      <h1>Todo List</h1>
      <p className="todo-subtitle">Stay organised. Get things done.</p>
      <form className="create-form" onSubmit={createTask}>
        <input
          type="text"
          placeholder="What needs to be done?"
          value={task}
          onChange={e => setTask(e.target.value)}
          required
        />
        <button type="submit" disabled={isSubmitting || !task.trim()}>
          {isSubmitting ? 'Adding…' : '+ Add'}
        </button>
      </form>
    </section>
  );
};

export default Create;
