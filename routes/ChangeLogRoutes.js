const express = require('express');
const passport = require('passport');
const ChangeLog = require('../models/ChangeLog');
const {paginationQuery, parseLimit, parseOffset, createNextUrl, createPreviousUrl, createBaseUrl} = require('../helpers/pagination');
const { userIsAdmin } = require('../middleware/route_guards');
const router = express.Router();

router.get('/', passport.authenticate('jwt', {session: false}), userIsAdmin, async (req, res) => {
    const query = req.query;
    const limit = parseLimit(query, 10);
    const offset = parseOffset(query.offset);
    try
    {
        const logs = await ChangeLog.find(query);
        const [response, count] = await paginationQuery(ChangeLog, query, offset, limit);
        const base_url = createBaseUrl(req, '/api/changelogs');
        const next = createNextUrl(base_url, query, offset, limit, count);
        const previous = createPreviousUrl(base_url, query, offset, limit, count);
        res.status(200).json({
            logs: response,
            next,
            previous
        });
    }
    catch(err)
    {
        res.status(500).json({message: err.message});
    }
});

module.exports = router;