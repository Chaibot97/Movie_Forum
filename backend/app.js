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
    .then(async (data) => {
      for (const r of data.rows) {
        castQuery.values = [r.id];
        await db.query(castQuery)
          .then((castData) => {
            r.actors = castData.rows;
          });
      };
      return data;
    })
    .then(async (data) => {
      for (const r of data.rows) {
        crewQuery.values = [r.id];
        await db.query(crewQuery)
        .then((crewData) => {
          r.crews = crewData.rows;
        });
      };
      return data;
    })
    .then((data)=>res.send(data.rows))
    .catch(e => console.error(e.stack))
}

app.get('/movies/:limit', (req, res) => {  
  console.log('GET', req.originalUrl);
  const { limit } = req.params;
  const query = {
    text: 'SELECT id,vote_avg, vote_count, poster_url, title, language, overview FROM moviedb.movie WHERE vote_count>5000 LIMIT $1',
    values: [limit],
  };

  send_movie_query(query, res);
})

app.get('/movies/rating/:limit', (req, res) => {  
  console.log('GET', req.originalUrl);
  const { limit } = req.params;
  const query = {
    text: 'SELECT id,vote_avg,vote_count,  poster_url, title, language, overview FROM moviedb.movie WHERE vote_count>5000 ORDER BY vote_avg DESC LIMIT $1',
    values: [limit],
  };
  send_movie_query(query, res);
})

app.get('/movie/:id', (req, res) => {
  console.log('GET', req.originalUrl);
  const { id } = req.params;
  const query = {
    text: 'SELECT id,vote_avg,vote_count,  poster_url, title, language, overview FROM moviedb.movie WHERE id = $1',
    values: [id],
  };
  send_movie_query(query, res);
});

app.get('/movies/:name/:limit', (req, res) => {  
  console.log('GET', req.originalUrl);
  const { name, limit } = req.params;
  const query = {
    text: `SELECT id,vote_avg,vote_count,  poster_url, title, language, overview 
    FROM moviedb.movie WHERE LOWER(title) like \'%${name.toLowerCase()}%\' 
    ORDER BY vote_count DESC LIMIT $1`,
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
    ORDER BY vote_count DESC LIMIT $1`,
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
    text: 'SELECT id, review as comment, user_name AS email FROM moviedb.movie_review, moviedb.review WHERE movie_id = $1 and review_id = id',
    values: [id],
  };
  send_query(query, res);
})

app.post('/review/add/:id/:review/:user', (req, res) => {  
  console.log('POST', req.originalUrl);
  const { id,review,user } = req.params;
  const query = {
    text: `WITH isrt AS (INSERT INTO moviedb.review (review, user_name) VALUES ('${review}','${user}') RETURNING *)
    INSERT INTO moviedb.movie_review (movie_id, review_id )
        VALUES (${id}, (SELECT id from isrt)) RETURNING *`,
  };

  send_query(query, res);
})

app.get('/likes/:userid', (req, res) => {  
  console.log('GET', req.originalUrl);
  const { userid } = req.params;
  const query = {
    text: 'SELECT m.id, m.title FROM moviedb.movie m, moviedb.like l, moviedb.user u WHERE l.movie_id = m.id AND u.id = l.user_id AND u.id = $1',
    values: [userid],
  };
  send_query(query, res);
})

app.post('/like/:movieid/:userid', (req, res) => {  
  console.log('POST', req.originalUrl);
  const { movieid, userid } = req.params;
  const query = {
    text: 'INSERT INTO moviedb.like (user_id, movie_id) VALUES ($2,$1)',
    values: [movieid, userid],
  };
  send_query(query, res);
})

app.post('/unlike/:movieid/:userid', (req, res) => {  
  console.log('POST', req.originalUrl);
  const { movieid, userid } = req.params;
  const query = {
    text: 'DELETE FROM moviedb.like WHERE user_id = $2 AND movie_id =$1',
    values: [movieid, userid],
  };
  send_query(query, res);
})

app.get('/login/:yaleid/', (req, res) => {  
  console.log('GET', req.originalUrl);
  const { yaleid } = req.params;
  const query = {
    text: `SELECT id FROM moviedb.user WHERE yale_id = '${yaleid}'`,
  };
  send_query(query, res);
})

app.post('/register/:yaleid/', (req, res) => {  
  console.log('GET', req.originalUrl);
  const { yaleid } = req.params;
  const query = {
    text: `INSERT INTO moviedb.user (yale_id) VALUES ('${yaleid}') RETURNING id`,
  };
  send_query(query, res);
})

const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
})
