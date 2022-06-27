const mongoose = require('mongoose')

require('dotenv').config()

mongoose.connect(process.env.DATABASE,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
    console.log('Database Connected Successully')
}).catch(()=>{
    console.log('Error in Database Connection')
})