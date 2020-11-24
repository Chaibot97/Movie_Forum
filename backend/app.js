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

const send_query = (query, res) => {
  db.query(query)
    .then((data) => {
      res.send(data.rows);
    })
    .catch(e => console.error(e.stack))
}

const send_movie_query = (query, res) => {
  const crewQuery = {
    text: 'SELECT name, job, profile_url FROM moviedb.movie_crew t, moviedb.crew WHERE movie_id = $1 and crew_id = id',
  };
  const castQuery = {
    text: 'SELECT name, character, profile_url FROM moviedb.movie_cast t, moviedb.actor WHERE movie_id = $1 and actor_id = id ORDER BY t.order',
  };
  db.query(query)
    .then((data) => {
      return Promise.all(data.rows.map((r) => {
        const new_r = r;
        castQuery.values = [r.id];
        return db.query(castQuery)
          .then((castData) => {
            new_r.actors = castData.rows;
            return new_r;
          });
      }));
    })
    .then((data) => {
      return Promise.all(data.map((r) => {
        const new_r = r;
        crewQuery.values = [r.id];
        return db.query(crewQuery)
          .then((crewData) => {
            new_r.crews = crewData.rows;
            return new_r;
          });
      }));
    })
    .then((data)=>res.send(data))
    .catch(e => console.error(e.stack))
}

app.get('/movies/:limit', (req, res) => {  
  console.log('GET', req.originalUrl);
  const { limit } = req.params;
  const query = {
    text: 'SELECT id,vote_avg, vote_count, poster_url, title, language, overview FROM moviedb.movie ORDER BY id DESC LIMIT $1',
    values: [limit],
  };

  send_movie_query(query, res);
})

app.get('/movies/rating/:limit', (req, res) => {  
  console.log('GET', req.originalUrl);
  const { limit } = req.params;
  const query = {
    text: 'SELECT id,vote_avg,vote_count,  poster_url, title, language, overview FROM moviedb.movie WHERE vote_count>100 ORDER BY vote_avg DESC LIMIT $1',
    values: [limit],
  };
  send_movie_query(query, res);
})

app.get('/movies/:name/:limit', (req, res) => {  
  console.log('GET', req.originalUrl);
  const { name, limit } = req.params;
  const query = {
    text: `SELECT id,vote_avg,vote_count,  poster_url, title, language, overview 
    FROM moviedb.movie WHERE LOWER(title) like \'%${name.toLowerCase()}%\' 
    ORDER BY id DESC LIMIT $1`,
    values: [limit],
  };
  send_movie_query(query, res);
})

app.get('/movies/actor/:name/:limit', (req, res) => {  
  console.log('GET', req.originalUrl);
  const { name, limit } = req.params;
  const query = {
    text: `SELECT m.id,vote_avg,vote_count,  poster_url, title, language, overview 
    FROM moviedb.movie m 
    JOIN moviedb.movie_cast c ON m.id = c.movie_id 
    JOIN moviedb.actor a ON c.actor_id = a.id
    WHERE LOWER(a.name) like \'%${name.toLowerCase()}%\' 
    ORDER BY id DESC LIMIT $1`,
    values: [limit],
  };
  send_movie_query(query, res);
})

app.get('/actors/:id', (req, res) => {  
  console.log('GET', req.originalUrl);
  const { id } = req.params;
  const query = {
    text: 'SELECT name, character, profile_url FROM moviedb.movie_cast t, moviedb.actor WHERE movie_id = $1 and actor_id = id ORDER BY t.order',
    values: [id],
  };
  send_query(query, res);
})

app.get('/keywords/:id', (req, res) => {  
  console.log('GET', req.originalUrl);
  const { id } = req.params;
  const query = {
    text: 'SELECT name FROM moviedb.movie_keyword, moviedb.keyword WHERE movie_id = $1 and keyword_id = id',
    values: [id],
  };
  send_query(query, res);
})

app.get('/genre/:id', (req, res) => {  
  console.log('GET', req.originalUrl);
  const { id } = req.params;
  const query = {
    text: 'SELECT name FROM moviedb.movie_genre, moviedb.genre WHERE movie_id = $1 and genre_id = id',
    values: [id],
  };
  send_query(query, res);
})

app.get('/collection/:id', (req, res) => {  
  console.log('GET', req.originalUrl);
  const { id } = req.params;
  const query = {
    text: 'SELECT name, poster_url, backdrop_url FROM moviedb.movie_collection, moviedb.collection WHERE movie_id = $1 and collection_id = id',
    values: [id],
  };
  send_query(query, res);
})

app.get('/review/:id', (req, res) => {  
  console.log('GET', req.originalUrl);
  const { id } = req.params;
  const query = {
    text: 'SELECT review, user_name FROM moviedb.movie_review, moviedb.review WHERE movie_id = $1 and review_id = id',
    values: [id],
  };
  send_query(query, res);
})

app.get('/review/add/:id/:review/:user', (req, res) => {  
  console.log('GET', req.originalUrl);
  const { id,review,user } = req.params;
  const query = {
    text: `WITH isrt AS (INSERT INTO moviedb.review (review, user_name) VALUES ('${review}','${user}') RETURNING *)
    INSERT INTO moviedb.movie_review (movie_id, review_id )
        VALUES (${id}, (SELECT id from isrt)) RETURNING *`,
  };

  send_query(query, res);
})

const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
})
