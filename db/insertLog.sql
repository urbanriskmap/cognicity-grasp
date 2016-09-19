/* insertLog - add item to cognicity-grasp log
 * @param {string} card_id Unique card reference
 * @param {string} event_type Description of card event
 *
 */
INSERT INTO grasp_log (card_id, event_type) VALUES ($1, $2);
