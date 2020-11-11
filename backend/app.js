const app = require('express')();

const port = 6886;

const db = require('./db');

// Add headers
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:19006');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

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
