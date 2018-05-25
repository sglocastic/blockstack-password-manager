const app = require('express')();
const cors = require('cors')
const jsontokens = require('jsontokens')

function verifyAuthResponse(token) {
  const tokenData = jsontokens.decodeToken(token)
  const publicKey = tokenData.payload.public_keys[0]

  const verified = new jsontokens.TokenVerifier('ES256K', publicKey)
    .verify(token)

  return verified ? tokenData : null
}

async function start() {
  app.use(cors())

  app.get('/auth', (req, res) => {
    const token = req.get('Authorization').split('Bearer ').slice(-1)[0]

    const data = verifyAuthResponse(token)

    res.status(200)
    res.send(JSON.stringify({ success: !!data }))
  })

  app.listen(8081);
  console.log('auth server running on 8081')
}

start();