// imports here for express and pg
const express = require('express');
const pg = require('pg');
const path = require('path');

const app = express();
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_notes_db')
// static routes here (you only need these for deployment)
app.use(express.static(path.join(__dirname, '../client/dist')));

// app routes here
app.get('/', (req, res)=> res.sendFile(path.join(__dirname, '../client/dist/index.html')))
app.get('/api/notes', async (req, res, next) => {
  try {
    const SQL = `SELECT * FROM notes;`;
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (err) {
    next(err);
  }
})

// create your init function
const init = async () => {
  await client.connect();
  const SQL = `
    DROP TABLE IF EXISTS notes;
    CREATE TABLE notes(
      id SERIAL PRIMARY KEY,
      txt VARCHAR(255),
      starred BOOLEAN DEFAULT FALSE
    );
    INSERT INTO notes(txt, starred) VALUES('learn express', false);
    INSERT INTO notes(txt, starred) VALUES('write SQL queries', true);
    INSERT INTO notes(txt) VALUES('create routes');
    INSERT INTO notes(txt) VALUES('create middleware');
    INSERT INTO notes(txt) VALUES('create db connections');
  `;
  
  await client.query(SQL);
  console.log('data seeded')
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`App listening in port ${PORT}`);
  })
}
// init function invocation
init();