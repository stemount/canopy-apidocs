![Logo](/canopylogo.png "Logo")

# API Documentation

## Introduction

The Canopy API is REST based.

https://en.wikipedia.org/wiki/Representational_state_transfer

We follow standard behaviour in terms of URL's, JSON request/response bodies where applicable and standard HTTP error codes.

## Environment Details

Canopy has three environments. Each environment has its own URL, which will be used by external clients in order to test functionality and then use
it on production:

* Development
* Staging
* Production

## Requesting Your Credentials

Credentials are provided on request by Canopy to yourselves.  Please speak to your account manager here to obtain the details for the environments.

## Requesting an API Token

You need to request an API token to make calls to the Canopy API. In order to do this you need to:

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
      "access_token": "Bearer eyaasd456FFGDFGdfgdfgdfgdfg7sdyfg35htjl3bhef89y4rjkbergv-KAj-dGh0xEuZftO_Utm6dugKQ",
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

### Get the List of Branches

The endpoint below returns the list of client's branches mapped with Canopy branches:
```
GET /referencing-requests/client/:clientId/branches-list
```

Parameters:
```
clientId: your client reference
```

Response body:
```
/* an array of branches, each of them has the following structure */

"branches": [
  {
    "canopyBranchId": string — id of the Canopy branch,
    "clientBranchId": string — id of the client's branch,
    "branchName": string — the name of the Canopy branch,
    "branchAddress": {
      "id": string,
      "line1": string,
      "line2": string,
      "line3": string,
      "street": string,
      "town": string,
      "postCode": string,
      "countryCode": string,
      "flat": string,
      "district": string,
      "houseNumber": string,
      "houseName": string
    },
  }
]
```

### Link Branch
The endpoint below links existing Canopy branch with client's branch:

```
POST /referencing-requests/client/:clientId/link-branch
```

Parameters:
```
clientId: your client reference
```

Request body:
```
canopyBranchId: string
clientBranchId: string
```

Successful response body:
```
"canopyBranchId": string — id of the Canopy branch
"clientBranchId": string — id of the client's branch,
"branchName": string — name of the Canopy branch
"branchAddress": {
  "id": string,
  "line1": string,
  "line2": string,
  "line3": string,
  "street": string,
  "town": string,
  "postCode": string,
  "countryCode": string,
  "flat": string,
  "district": string,
  "houseNumber": string,
  "houseName": string
}
```

Unsuccessful response body:
```
/* If requested Canopy branch is not associated with client's agency you’ll get the following error */

"success": false,
"requestId" — the identifier of the request,
"error": {
  "status": 400,
  "type" — error type,
  "message" — “Requested canopy branch is not associated with the client's agency”,
}
```

### Delete Branch Mapping
The endpoints below deletes existing branch mapping between Canopy and client:

```
DELETE /referencing-requests/client/:clientId/branch-mapping/:clientBranchId
```

Parameters:
```
clientId: your client reference
clientBranchId: id of the branch linked with the Canopy branch
```

Response body:
```
clientBranchId: string
```

### Request Referencing

```
POST /referencing-requests/client/:clientId/request
```

Parameters:
```
clientId: your client reference
```

Request body:

Currently, we support two request body schemas:

1. [DEFAULT SCHEMA] With all user details at registration and callback URL:

    ```
    "email": string | (required)
    "firstName": string | (optional)
    "middleName": string | (optional)
    "latName": string | (optional)
    "callbackUrl": string | (required) URL to which Canopy will send PDF Report
    "requestType": enum | (required) RENTER_SCREENING, GUARANTOR_SCREENING
    "itemType": enum | (required) INSTANT, FULL
    "title": string | (optional) it's a title used before a surname or full name
    "phone": string | (optional)
    "branchId": string | (optional) this is an identifier of the client's branch which requests the user
    "clientReferenceId": string | (optional) this is unique identifier on the client's side
    ```

2. [ALTERNATIVE SCHEMA] With `clientReference` we get request details in a separate call:

    ```
    "clientReference": string | (required)
    "canopyReference": uuid | (optional) this is an identifier of the same user in Canopy database
    "branchId": uuid | (optional) this is an identifier of the client's branch which requests the user
    "requestType": enum | (required) RENTER_SCREENING, GUARANTOR_SCREENING
    "itemType": enum  | (required) INSTANT, FULL
    ```

If a referencing request is registered successfully you will receive the following response:

  ```
  "requestId" - the identifier of the request,
  "success": true
  ```

If there was an `authentication` error while handling a new request, then you will receive the following:

  ```
  "success": false,
  "requestId" - the identifier of the request,
  "error": {
    "status": 401,
    "type" - error type,
    "message" - error message
  }
  ```
If there was a `validation` error while handling a new request, then you will receive the following:

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

### Referencing Updates (Milestones)

There are a number of milestone updates as part of the referencing process:

- `INVITED` - the user was invited to connect;

- `INVITE_RESENT` - resent invitation email for the user;

- `CONNECTED` - user accepts the connection;

- `CONNECTION_REJECTED` - user rejects the connection;

- `CONNECTION_STOPPED` - user stops the connection;

- `SENDING_COMPLETED_PASSPORT_FAILED` - sending the completed passport to Chancellors failed;

- `PASSPORT_COMPLETED` - `user complete his passport and the document was sent;

- `INVALID_APPLICATION_DETAILS` - Chancellors response for application details was invalid;

- `APPLICATION_DETAILS_REQUEST_FAILED` - request for Application details from Chancellors failed;

- `APPLICATION_DETAILS_NOT_MATCHED` - Chancellors response for application details matching return unsuccessful value;

- `APPLICATION_DETAILS_MATCHING_FAILED` - request for matching application details failed.

### Document Updates

Once referencing has been completed by the renter in the Canopy mobile application, an update message will be sent by the Canopy platform to an endpoint to indicate completion. This will include a field for the URL to download the passport from. Currently, we support 2 response schemas, which correspond to the request body schema:
  1. [DEFAULT SCHEMA]
      ```
      "clientReferenceId": string,
      "canopyReferenceId": uuid,
      "document": {
        "documentType": enum | 0 (means INSTANT screening type) or 1 (means FULL screening type),
        "url": `/referencing-requests/client/${clientId}/documents/${documentId}`,
        "maxRent": number,
        "status": string,
        "title": enum | INSTANT, FULL
      }
      ```

  2. [ALTERNATIVE SCHEMA]
      ```
      "clientReferenceId": string,
      "canopyReferenceId": uuid,
      "document": [
        {
          "documentType": enum | 0 (means INSTANT screening type) or 1 (means FULL screening type),
          "url": `/referencing-requests/client/${clientId}/documents/${documentId}`,
          "maxRent": number,
          "status": string,
          "title": enum | INSTANT, FULL
        }
      ]
      ```

### Rent Passport Retrieval

To retrieve a PDF rent passport following successful referencing completion, you can use the `url` field from the response:

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
* 4xx - indicate a client error with information provided (missign required parameters etc..)
* 5xx - indicate an error with the Canopy platform

We suggest you wrap 4xx errors in your client and provide a user friendly message to your end users as part of the integration.
