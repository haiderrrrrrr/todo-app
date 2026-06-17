import React, { useEffect, useMemo, useRef, useState } from 'react';
import Create from './Create';
import './App.css';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  BsCircle,
  BsClipboard2,
  BsClipboard2Check,
  BsFillCheckCircleFill,
  BsFillTrashFill,
  BsPencil,
} from 'react-icons/bs';

dayjs.extend(relativeTime);

const FILTERS = ['All', 'Active', 'Completed'];

const EditModal = ({ taskName, onSave, onCancel }) => {
  const [value, setValue] = useState(taskName);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSave = () => {
    const trimmed = value.trim();

    if (trimmed) {
      onSave(trimmed);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={event => event.stopPropagation()}>
        <div className="modal-icon">Edit</div>
        <h2>Edit task</h2>
        <input
          ref={inputRef}
          className="modal-text-input"
          type="text"
          value={value}
          onChange={event => setValue(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter') handleSave();
            if (event.key === 'Escape') onCancel();
          }}
          placeholder="Task cannot be empty"
        />
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onCancel}>Cancel</button>
          <button
            className="btn-save"
            onClick={handleSave}
            disabled={!value.trim() || value.trim() === taskName}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const DeleteModal = ({ taskName, onConfirm, onCancel }) => (
  <div className="modal-backdrop" onClick={onCancel}>
    <div className="modal" onClick={event => event.stopPropagation()}>
      <div className="modal-icon">Delete</div>
      <h2>Delete task?</h2>
      <p>
        <span className="modal-task-name">"{taskName}"</span>
        {' '}will be permanently removed.
      </p>
      <div className="modal-actions">
        <button className="btn-cancel" onClick={onCancel}>Cancel</button>
        <button className="btn-danger" onClick={onConfirm}>Delete</button>
      </div>
    </div>
  </div>
);

const SkeletonList = () => (
  <>
    {[1, 2, 3].map(item => (
      <div key={item} className="skeleton skeleton-task" />
    ))}
  </>
);

const Home = () => {
  const [todos, setTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const loadTodos = async () => {
      try {
        const response = await fetch('/api/get');

        if (!response.ok) {
          throw new Error('Failed to load todos');
        }

        setTodos(await response.json());
      } catch {
        setError('Could not load tasks. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTodos();
  }, []);

  const doneCount = useMemo(() => todos.filter(todo => todo.done).length, [todos]);
  const totalCount = todos.length;
  const progress = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  const filteredTodos = useMemo(() => {
    if (filter === 'Active') return todos.filter(todo => !todo.done);
    if (filter === 'Completed') return todos.filter(todo => todo.done);
    return todos;
  }, [todos, filter]);

  const handleTodoCreated = todo => {
    setTodos(currentTodos => [todo, ...currentTodos]);
    setError('');
  };

  const toggleDone = async todo => {
    try {
      const response = await fetch(`/api/edit/${todo._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done: !todo.done }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

      const updatedTodo = await response.json();
      setTodos(currentTodos => currentTodos.map(currentTodo => (
        currentTodo._id === todo._id ? updatedTodo : currentTodo
      )));
      setError('');
    } catch {
      setError('Could not update the task status.');
    }
  };

  const confirmEdit = async newText => {
    if (!editTarget) return;

    const { id } = editTarget;
    setEditTarget(null);

    try {
      const response = await fetch(`/api/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: newText }),
      });

      if (!response.ok) {
        throw new Error('Failed to save task');
      }

      const updatedTodo = await response.json();
      setTodos(currentTodos => currentTodos.map(todo => (
        todo._id === id ? updatedTodo : todo
      )));
      setError('');
    } catch {
      setError('Could not save the task.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    const { id } = deleteTarget;
    setDeleteTarget(null);

    try {
      const response = await fetch(`/api/delete/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setTodos(currentTodos => currentTodos.filter(todo => todo._id !== id));
      setError('');
    } catch {
      setError('Could not delete the task.');
    }
  };

  const emptyMessages = {
    All: {
      icon: <BsClipboard2 />,
      title: 'No tasks yet',
      sub: 'Add your first task above to get started.',
    },
    Active: {
      icon: <BsClipboard2Check />,
      title: 'All done!',
      sub: 'No active tasks. Enjoy the moment.',
    },
    Completed: {
      icon: <BsClipboard2Check />,
      title: 'Nothing completed yet',
      sub: 'Finish a task and it will show up here.',
    },
  };

  return (
    <>
      {editTarget && (
        <EditModal
          taskName={editTarget.task}
          onSave={confirmEdit}
          onCancel={() => setEditTarget(null)}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          taskName={deleteTarget.task}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <main className="app-shell">
        <Create onTodoCreated={handleTodoCreated} onError={setError} />

        {error && <div className="status-message error">{error}</div>}

        {!isLoading && totalCount > 0 && (
          <div className="stats-bar">
            <span className="stats-text">
              <span>{doneCount}</span> / {totalCount} done
            </span>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="stats-text">{progress}%</span>
          </div>
        )}

        {!isLoading && totalCount > 0 && (
          <div className="filter-tabs">
            {FILTERS.map(filterName => (
              <button
                key={filterName}
                className={`filter-tab${filter === filterName ? ' active' : ''}`}
                onClick={() => setFilter(filterName)}
              >
                {filterName}
                {filterName === 'Active' && ` (${todos.filter(todo => !todo.done).length})`}
                {filterName === 'Completed' && ` (${doneCount})`}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <SkeletonList />
        ) : filteredTodos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{emptyMessages[filter].icon}</div>
            <h3>{emptyMessages[filter].title}</h3>
            <p>{emptyMessages[filter].sub}</p>
          </div>
        ) : (
          filteredTodos.map(todo => {
            const createdLabel = todo.createdAt
              ? `Created ${dayjs(todo.createdAt).fromNow()}`
              : '';

            return (
              <div className="task" key={todo._id}>
                <div className="checkbox">
                  {todo.done ? (
                    <BsFillCheckCircleFill
                      className="check-icon done"
                      onClick={() => toggleDone(todo)}
                      title="Mark as pending"
                    />
                  ) : (
                    <BsCircle
                      className="check-icon"
                      onClick={() => toggleDone(todo)}
                      title="Mark as done"
                    />
                  )}

                  <div className="task-body">
                    <p className={todo.done ? 'through' : 'normal'}>
                      {todo.task}
                    </p>
                    {createdLabel && (
                      <div className="timestamp">{createdLabel}</div>
                    )}
                  </div>
                </div>

                <div className="actions">
                  <button
                    className="icon-btn edit-btn"
                    onClick={() => setEditTarget({ id: todo._id, task: todo.task })}
                    aria-label={`Edit ${todo.task}`}
                  >
                    <BsPencil className="icon" />
                  </button>

                  <button
                    className="icon-btn delete-btn"
                    onClick={() => setDeleteTarget({ id: todo._id, task: todo.task })}
                    aria-label={`Delete ${todo.task}`}
                  >
                    <BsFillTrashFill className="icon" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </main>
    </>
  );
};

export default Home;
