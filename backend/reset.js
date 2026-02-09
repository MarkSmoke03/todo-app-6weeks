const { Client } = require('pg');
require('dotenv').config();

const sampleTodos = [
    {title: 'Plan Week', description: 'Set goals', completed: false},
    {title: 'Document Project', description: 'Write docs', completed: false},
    {title: 'Test Features', description: 'Verify everything works', completed: true}
];

async function resetDatabase() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    try {
        await client.connect();
        await client.query('DELETE FROM todos');
        await client.query('ALTER SEQUENCE todos_id_seq RESTART WITH 1');
        
        for (let i = 0; i < sampleTodos.length; i++) {
            const todo = sampleTodos[i];
            await client.query(
                'INSERT INTO todos (title, description, completed, position) VALUES (, , , )',
                [todo.title, todo.description, todo.completed, i]
            );
        }
        
        console.log('✅ Database reset with', sampleTodos.length, 'todos');
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await client.end();
    }
}
resetDatabase();
