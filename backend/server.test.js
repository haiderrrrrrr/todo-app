const assert = require('node:assert/strict');
const test = require('node:test');
const app = require('./server');

test('GET /api/health returns ok', async t => {
  const server = app.listen(0);
  t.after(() => server.close());

  const { port } = server.address();
  const response = await fetch(`http://127.0.0.1:${port}/api/health`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, { status: 'ok' });
});
