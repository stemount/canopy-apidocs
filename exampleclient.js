const axios = require('axios')
const base64url = require('base64url');
const fs = require('fs');
const jwt = require('jsonwebtoken');

function generatePayload(config) {
    const now = Math.floor(Date.now() / 1000); // sec
    const expires = now + 60 * 60;
    var payload = {
        iss: 'canopy.rent',
        scope: 'request.write_only document.read_only',
        aud: `referencing-requests/client/${config['clientId']}/token`,
        exp: expires,
        iat: now
    };
    return base64url.encode(JSON.stringify(payload))
}

// Generate hmac
function generateJwtKey(config) {   
    return jwt.sign(generatePayload(config), config['secretKey']);
}

var config = JSON.parse(fs.readFileSync('credentials.json', 'utf8'));
console.log(`Config: ${JSON.stringify(config, null, 2)}`);

const HEADERS = { 'x-api-key': config['apiKey'] };
const BODY = { 'jwtKey': generateJwtKey(config) };
const ENDPOINT = `${config['url']}/referencing-requests/client/${config['clientId']}/token`

axios.post(ENDPOINT, BODY, { headers: HEADERS }).then(function (response) {  
    // console.log(`\nResponse: ${JSON.stringify(response.data, null, 2)}`);
    console.log(response);
  })
  .catch(function (data) {    
    console.log(data);    
});