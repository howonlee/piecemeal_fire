import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import expenses from './routes/expenses.js';

const app = new Hono();

// Middleware
app.use('/*', cors());

// Routes
app.route('/api/expenses', expenses);

// Health check
app.get('/', (c) => {
  return c.json({ status: 'ok', message: 'Expense Tracker API' });
});

const port = 3000;

console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port
});
