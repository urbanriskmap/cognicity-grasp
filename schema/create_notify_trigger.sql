CREATE FUNCTION notify_trigger() RETURNS trigger AS $$
DECLARE
BEGIN
  PERFORM pg_notify('watchers', '{"' || TG_TABLE_NAME || '":{"pkey":"' || NEW.pkey || '", "username": "'|| NEW.username ||'", "network": "' || NEW.network || '"}}' );
  RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER watched_table_trigger
  AFTER UPDATE ON grasp_cards
  FOR EACH ROW
  WHEN (NEW.received = TRUE)
  EXECUTE PROCEDURE notify_trigger();
