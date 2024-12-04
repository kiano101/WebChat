const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const router = express.Router()

const SECRET_KEY = 'lemonJuice';

router.post("/register", async(req, res) => {
    const {username, email, password} = req.body
    console.log(username, email, password)

    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = new User({username, email, password: hashedPassword})
        console.log('user created but not saved to db')
        await newUser.save()
        res.status(201).json({message: 'User registered successully'})
    } catch (error) {
        res.status(400).json({error: 'Error creating user'})
        console.error("Error saving user: ", error.message)
    }
})

router.post('/login', async (req, res) => {
    const {email, password} = req.body
    try {
        const user = await User.findOne({email})
        if (!user) return res.status(401).json({error: 'User not found'});

        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch) return res.status(401).json({message: 'Invalid credentials'})

        const token = jwt.sign({id: user._id, email: user.email}, SECRET_KEY, {expiresIn: '1h'})
        res.json({token, username: user.username})
    } catch (error) {
        res.status(500).json({error: 'Server error'});
    }
})


module.exports = router