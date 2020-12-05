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

### User functions
To get user id

- GET `/login/YALEID/`
- GET `/register/YALEID/`


To get comments

- POST `/review/add/ID/REVIEW/USER`


To get and update likes
- GET `/likes/USERID`
- POST `/like/MOVIEID/USERID`
- POST `/unlike/MOVIEID/USERID`