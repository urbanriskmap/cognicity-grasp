If you already had an old database, drop it first 
psql -c 'drop database cognicity_grasp' 

First create the database: 
psql -f createdb.sql 

then do: to populate the newly created db 
psql -d cognicity_grasp -f schema.sql
