const express = require ('express')
const cors = require ('cors')
const bodyParser = require ('body-parser')
require('./db/db')
require('dotenv').config()

const app = express()

const router = require('./routes/user')

app.use(bodyParser.json())
app.use(cors())

app.use('/api', router)
const port = (process.env.PORT || 5000)

app.listen(port,() => {
    console.log(`Server Started at port: ${port}`)
})
