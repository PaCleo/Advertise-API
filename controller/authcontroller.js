const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth.json');

const {User} = require('../models/user');

const router = express.Router();

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400,
    });
}

router.post('/register', async (req, res) => {
    const { name, password } = req.body;
    console.log('merda');

    try {
        if (await User.findOne({ where: { name } }))
            return res.status(400).send({ error: 'User already exists' });

        const user = await User.create({
            name: name,
            password: password
        });
        user.password = undefined;

        return res.send({
            user,
            token: generateToken({ id: user.id })
        });
    } catch (err) {
        return res.status(400).send({ error: 'Registration failed' });
    }
});

router.post('/login', async (req, res) => {
    const { name, password } = req.body;

    const user = await User.findOne({ where: { name } });

    if (!user)
        return res.status(400).send({ error: 'User not found' });

    if (!await bcrypt.compare(password, user.password)) {
        return res.status(400).send({ error: 'Wrong password' });
    }

    user.password = undefined;
    const token = jwt.sign({ id: user.id }, authConfig.secret, {
        expiresIn: 86400,
    });

    res.send({
        user,
        token: generateToken({ id: user.id })
    });
});


module.exports = app => app.use('/auth', router);