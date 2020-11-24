# Backend module for database accessing

### Run

    node app.js


### API
`PORT` = 6886 

GET\
`LIMIT` number of Movies
- `/movies/LIMIT`
- `/movies/rating/LIMIT`    sorted by rating
- `/movies/NAME/LIMIT`      Search by (partial) movie `NAME`
- `/movies/actor/NAME/LIMIT`      Search by (partial) actor `NAME`
  
Details for movie with `ID`
- `/actors/ID`
- `/keywords/ID`
- `/genre/ID`
- `/collection/ID`
- `/review/ID`

User functions
- `/review/add/ID/REVIEW/USER`