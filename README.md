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

TODO: Zhenya/Anton: How do I request the clientId and secretKey

## Authentication and Authorisation

You need to generate a jwtKey that you have been provided by Canopy based on the:

* clientId
* secretKey 

The details here will be specific to the language/ecosystem you are building the integration within.  

We stipulate that a JWT needs to be constructed by:

a) Generating a Base64 encoded header with a HS256 HMAC

b) Constructuring a Base64 encoded payload using the following details:

```
var payload = new {
    iss: "canopy.rent",
    scope: "request.write_only document.read_only",
    aud: `referencing-requests/client/${clientId}/token`,
    exp: expires,
    iat: now
};
```

c) Hashing the payload with HMAC SHA256 and Base64 encoding the payload

e.g. For .NET an example is provided: https://www.petermorlion.com/generating-a-jwt-in-net-4-5-2/

## Requesting an Authorisation Token

You can request an authorisation token from the following endpoint:

```
GET /referencing-requests/client/:clientId/token
```

In order to do this successfullly you need to include the x-api-key in the header:

```
x-api-key: "" (API key)
```

and the jwtKey in the body as follows:

```
jwtKey: ""
```

The response body will contain a token. 

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

Response:
* TODO

### Document Updates

Once referencing has been completed by the renter in the Canopy mobile application, an update message will be sent by the Canopy platform to an endpoint to indicate completion.  This will include a field for the URL to download the passport from:

```
url: /referencing-requests/client/${clientId}/documents/9e6181ee-333b-4497-b13a-07727363a6b6
```

TODO: Zhenya/Anton: Can we configure the callback here for a given client?  e.g. Jon Properties Limited

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
content-disposition: attachment; filename='9e6181ee-333b-4497-b13a-07727363a6b6_FULL.pdf'
```

## Errors

We use conventional HTTP response codes to indicate the success or failure of an API request, typically one of:

* 2xx - indicate success
* 4xx - indicate an client error with information provided (missign required parameters etc..)
* 5xx - indicate an error with the Canopy platform

We suggest you wrap 4xx errors in your client and provide a user friendly message to your end users as part of the integration.
