Do  to create the db with postgis extension enabled 
psql cognicity_grasp -c "CREATE EXTENSION postgis;"

then do: to populate the newly created db 
psql -d cognicity_grasp -f schema.sql
