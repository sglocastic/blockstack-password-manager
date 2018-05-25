const express = require('express')
const cors = require('cors')
const serveStatic = require('serve-static')

const app = express()

app.use(cors())
app.use(serveStatic('dist', {'index': ['index.html' ]}))
app.listen(3000)