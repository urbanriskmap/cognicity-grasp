/* checkCardStatus - Check status of card by ID
 * @param {string} card_id Unique card reference
 *
 */

SELECT received FROM grasp_cards WHERE card_id = $1
