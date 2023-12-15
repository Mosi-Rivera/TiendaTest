const passport = require('passport');
const express = require('express');
const { userIsAdmin } = require('../middleware/route_guards');
const User = require('../models/User');
const ChangeLog = require('../models/ChangeLog');
const router = express.Router();

router.put('/change_role', passport.authenticate('jwt', {session: false}), userIsAdmin, async (req, res) => {
    const {user_id, role} = req.body;
    try
    {
        if (
            !user_id ||
            role == 'ADMIN'
        ) throw new Error("Invalid id or role.");
        const user = await User.findOneAndUpdate(
            {
                _id: user_id,
                $and: [{role: {$ne: "ADMIN"}}, {role: {$ne: role}}]
            },
            {role},
            {new: true, runValidators: true}
        );
        if (!user)
            throw new Error('Invalid id or role.');
        await ChangeLog.saveNewChangeRoleLog(req.user, user);
        res.status(200).json({
            message: "User role sucesfully changed.",
            user
        });
    }
    catch(err)
    {
        res.status(500).json({message: err.message});
    }
});

router.post('/new_address', passport.authenticate('jwt', {session: false}), async (req, res) => {
    try
    {
        const user = await User.findByIdAndUpdate(req.user._id, {$push: {delivery_addresses: req.body}}, {runValidators: true});     
        if (!user)
            throw new Error("Could not add address. Try again later.");
        res.status(200).json({message: "Address added to user document."});
    }
    catch(err)
    {
        res.status(500).json({message: err.message});
    }
});

router.delete('/delete_address', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let {ids} = req.query;
    try
    {
        if (!ids)
            throw new Error("No ids provided for deletion.");
        ids = ids.split(',');
        await User.findOneAndUpdate(req.user._id, {
            $pull: {
                delivery_addresses: {
                    _id: {
                        $in: ids
                    } 
                }
            }
        });
        res.status(200).json({message: "Address deleted."});
    }
    catch(err)
    {
        res.status(500).json({message: err.message});
    }
});

module.exports = router;