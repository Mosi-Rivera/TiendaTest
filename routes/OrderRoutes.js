const express = require('express');
const passport = require('passport');
const { userIsStaff } = require('../middleware/route_guards');
const {parseLimit, parseOffset, createNextUrl, createPreviousUrl, createBaseUrl, paginationQuery} = require('../helpers/pagination');
const Order = require('../models/Order');
const router = express.Router();

router.get('/', passport.authenticate('jwt'), userIsStaff, async (req, res) => {
    try
    {
        let limit = parseLimit(req.query.limit, 20);
        let offset = parseOffset(req.query.offset);
        const [orders, count] = await paginationQuery(
            Order,
            req.query,
            offset,
            limit
        );
        const full_url = createBaseUrl(req, '/orders');
        res.status(200).json({
            orders,
            next: createNextUrl(full_url, req.query, offset, limit, count),
            previous: createPreviousUrl(full_url, req.query, offset, limit, count)
        });
    }
    catch(err)
    {
        res.status(500).json({message: err.message});
    } 
});

module.exports = router;