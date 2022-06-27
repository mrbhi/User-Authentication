const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        maxlength: 64,
        trim: true
    },
    email:{
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    resetlink:{
        data: String,
        default: ''
    }
},{timestamp: true})

module.exports = mongoose.model("User", userSchema)