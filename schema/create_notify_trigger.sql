CREATE FUNCTION notify_grasp_cards_trigger() RETURNS trigger AS $$
DECLARE
BEGIN
  PERFORM pg_notify('watchers', '{"' || TG_TABLE_NAME || '":{"pkey":"' || NEW.pkey || '", "username": "'|| NEW.username ||'", "network": "' || NEW.network || '"," "language": "'|| NEW.language ||'}}' );
  RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER watch_grasp_cards_trigger
  AFTER UPDATE ON grasp_cards
  FOR EACH ROW
  WHEN (NEW.received = TRUE)
  EXECUTE PROCEDURE notify_grasp_cards_trigger();
