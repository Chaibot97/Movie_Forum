The database backup files provides a way to reconstruct the entire database WITHOUT running the csv processing script.
The backup files are in the format of plain sql. i.e. "INSERT INTO .... VALUES ...."

_To reconstruct the database, run_

    createdb postgres
    gunzip -c moviedb.sql.gz | psql postgres 

Note:
1. The plain sql file is compressed in a zip file in order to fit in 100mb github storage limit.

