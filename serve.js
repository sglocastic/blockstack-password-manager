const express = require('express')
const cors = require('cors')
const serveStatic = require('serve-static')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(serveStatic('dist', {'index': ['index.html' ]}))
app.listen(PORT)
console.log('server serving on port', PORT)