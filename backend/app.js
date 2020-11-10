const app = require('express')();

const port = 6886;

const db = require('./db');


app.get('/movies/:num', (req, res) => {  
  console.log('GET', req.originalUrl);
  const { num } = req.params;
  const query = {
    text: 'select id, poster_url, title,language from moviedb.movie limit $1',
    values: [num],
  };
  db.query(query)
    .then((data) => {
      res.send(data.rows);
    })
    .catch(e => console.error(e.stack))
})


const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
})
