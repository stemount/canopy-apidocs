![Logo](/canopylogo.png "Logo")

# API Documentation

## Introduction

The Canopy API is REST based.

https://en.wikipedia.org/wiki/Representational_state_transfer

We follow standard behaviour in terms of URL's, JSON request/response bodies where applicable and standard HTTP error codes.

## Environment Details

Canopy has 3 environments. Each environment has its own URL, which will be used by external clients in order to test functionality and then use
it on production:

Development
```
https://backend-dev-qwertyuiop.canopy.rent
```

Staging
```
https://backend-stag-qwertyuiop.canopy.rent
```

Production
```
https://backend-prod.canopy.rent
```

## Requesting Your Credentials

Credentials are provided on request by Canopy to yourselves.  Please speak to your account manager here.

## Requesting an API Token

You need to request an API token to make calls to the Canopy API.

In order to do this you need to:

1. Generate a payload using the clientId from the credentials you have been sent.  The example here uses Javascript:

```
function generatePayload(clientId) {
  const now = Math.floor(Date.now() / 1000); // sec
    const expires = now + 60 * 60;
    var payload = {
        iss: 'canopy.rent',
        scope: 'request.write_only document.read_only',
        aud: `referencing-requests/client/${clientId}/token`,
        exp: expires,
        iat: now
    };
  return base64url.encode(JSON.stringify(payload))
}
```

2. You need to sign this with JWT (e.g. jsonwebtoken in Javascript) using the secretKey in the credentials you were sent

```
const jwtKey = jwt.sign(generatePayload(config), secretKey);
```

The BODY of the request should include the following
```
jwtKey: jwtKey
```

3. The header of the request should include the apiKey from the credentials you were sent

```
x-api-key: apiKey
```

4. Finally make a POST request with the header and body to the following endpoint:

```
POST /referencing-requests/client/:clientId/token
```

If the request is successful, the response body will contain the token for future API requests with an expires timestamp:


```
...
Response: {
  "success": true,
  "access_token": "Bearer eyaasd456FFGDFGdfgdfgdfgdfg7sdyfg359tu345gtbsdv784ygtbkjl3g80y35htjl3bhef89y4rjkbergv-KAj-dGh0xEuZftO_Utm6dugKQ",
  "expires": 1594907203
}
...
```

## Using the Authorization Token

You need to include the x-api-key and authorization token in the headers with all Canopy API endpoint requests.

```
x-api-key: key
Authorization: token
```

This token has an expiryTime of 20 minutes, after which you will receive an authorization error, and you will then need to retrieve a new token.

## Referencing Endpoints

### Request Referencing

```
POST /referencing-requests/client/:clientId/request
```

Parameters:
```
clientId: your client reference
```

Request body:

Currently, we support 2 request body schemas:

1. With `clientReference` by which we get request details in a separate call:

    ```
    "clientReference": string | (required)
    "canopyReference": uuid | (optional) this is an identifier of the same user in Canopy database
    "branchId": uuid | (optional) this is an identifier of the client's branch which requests the user
    "requestType": enum | (required) RENTER_SCREENING, GUARANTOR_SCREENING
    "itemType": enum  | (required) INSTANT, FULL
    ```

2. With all user details at registration and callback URL:

    ```
    "email": string | (required)
    "firstName": string | (optional)
    "middleName": string | (optional)
    "latName": string | (optional)
    "callbackUrl": string | (required) URL to which Canopy will send PDF Report
    "requestType": enum | (required) RENTER_SCREENING, GUARANTOR_SCREENING
    "itemType": enum | (required) INSTANT, FULL
    ```

Response:

- If Canopy server successfully registered a new referencing request, the response will be the following:

  ```
  "requestId" - the identifier of the request,
  "success": true
  ```

- If the server threw an `authentication` error while handling a new request, then the response will be the following:

  ```
  "success": false,
  "requestId" - the identifier of the request,
  "error": {
    "status": 401,
    "type" - error type,
    "message" - error message
  }
  ```
- If the server threw a `validation` error while handling a new request, then the response will be the following:

  ```
  "success": false,
  "requestId" - the identifier of the request,
  "error": {
    "status": 400,
    "type" - error type,
    "message" - error message,
    "errors": [] - an array of error objects, each of them has the following structure:
      {
        "type" - error type,
        "path" - error path,
        "message" - error message
      }
  }
  ```

### Document Updates

Once referencing has been completed by the renter in the Canopy mobile application, an update message will be sent by the Canopy platform to an endpoint to indicate completion.  This will include a field for the URL to download the passport from:

```
GET /referencing-requests/client/${clientId}/documents/{documentId}
```

### Rent Passport Retrieval

To retrieve a PDF rent passport following successful referencing completion, you can use the following:

```
GET /referencing-requests/client/${clientId}/documents/${documentId}
```

Parameters:
```
clientId: your client reference
documentId: the ID of the document returned from the document update
```

Response:

The PDF will be included in the response body with the filename specified in the header as follows:

```
content-type: application/pdf
content-disposition: attachment; filename='9e6222ee-312b-2297-a03a-07700363a6b6_FULL.pdf'
```

## Errors

We use conventional HTTP response codes to indicate the success or failure of an API request, typically one of:

* 2xx - indicate success
* 4xx - indicate an client error with information provided (missign required parameters etc..)
* 5xx - indicate an error with the Canopy platform

We suggest you wrap 4xx errors in your client and provide a user friendly message to your end users as part of the integration.
