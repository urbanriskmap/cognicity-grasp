--Table grasp_card_id (card_id, received[true/false])
CREATE TABLE grasp_cards (
  pkey bigserial NOT NULL,
  card_id varchar NOT NULL UNIQUE,
  username varchar NOT NULL,
  network varchar NOT NULL,
  language varchar NOT NULL,
  received boolean,
  report_id bigint UNIQUE,
  CONSTRAINT pkey_grasp_cards PRIMARY KEY (pkey)
);

--Table grasp_reports
CREATE TABLE grasp_reports (
  pkey bigserial NOT NULL,
  card_id varchar NOT NULL UNIQUE,
  database_time timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone,
  text varchar,
  water_depth integer,
  image_id bigint,
  status varchar,
  location geometry(Point, 4326),
  CONSTRAINT pkey_grasp_reports PRIMARY KEY (pkey)
);

--Table grasp_report_images
CREATE TABLE grasp_report_images (
  pkey bigserial NOT NULL,
  card_id varchar NOT NULL,
  filename varchar,
  url_path varchar,
  CONSTRAINT pkey_grasp_report_images PRIMARY KEY (pkey)
);

--Table grasp_log
CREATE TABLE grasp_log (
  pkey bigserial NOT NULL,
  database_time timestamp with time zone DEFAULT now(),
  card_id varchar,
  --user_id,
  event_type varchar,
  CONSTRAINT pkey_grasp_log PRIMARY KEY (pkey)
);

--Notifications on  grasp cards table updates
CREATE FUNCTION notify_grasp_cards_trigger() RETURNS trigger AS $$
DECLARE
BEGIN
  PERFORM pg_notify('watchers', '{"' || TG_TABLE_NAME || '":{"pkey":"' || NEW.pkey || '", "username": "'|| NEW.username ||'", "network": "' || NEW.network || '", "language": "'|| NEW.language ||'", "report_id": "' || NEW.report_id || '"}}' );
  RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER watch_grasp_cards_trigger
  AFTER UPDATE ON grasp_cards
  FOR EACH ROW
  WHEN (NEW.received = TRUE)
  EXECUTE PROCEDURE notify_grasp_cards_trigger();

--Push grasp reports into reports table
-- Function: public.update_all_reports_from_tweets()

-- DROP FUNCTION public.update_all_reports_from_tweets();

CREATE OR REPLACE FUNCTION public.update_all_reports_from_grasp()
  RETURNS trigger AS
$BODY$
	BEGIN
		IF (TG_OP = 'UPDATE') THEN
			INSERT INTO all_reports (fkey, created_at, text, source, lang, url, the_geom) SELECT NEW.pkey, NEW.created_at, NEW.text, 'grasp', NEW.lang, NEW.url, NEW.the_geom;
			RETURN NEW;
		ELSIF (TG_OP = 'INSERT') THEN
			INSERT INTO all_reports (fkey, created_at, text, source, lang, url, the_geom) SELECT NEW.pkey, NEW.created_at, NEW.text, 'grasp', NEW.lang, NEW.url, NEW.the_geom;
			RETURN NEW;
		END IF;
	END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION public.update_all_reports_from_grasp()
  OWNER TO postgres;
