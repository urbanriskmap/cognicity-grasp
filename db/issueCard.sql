/* issueCard - register card issue in database
 * @param {string} card_id Unique card reference
 *
 * 
 */
INSERT INTO grasp_cards (card_id, received) VALUES ($1, FALSE);
