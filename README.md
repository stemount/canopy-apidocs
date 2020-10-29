![Logo](/canopylogo.png "Logo")

# API Documentation

## Introduction

The Canopy API is REST based.

https://en.wikipedia.org/wiki/Representational_state_transfer

We follow standard behaviour in terms of URL's, JSON request/response bodies where applicable and standard HTTP error codes.

## Environment Details

Canopy has three environments. Each environment has its own URL, which will be used by external clients in order to test functionality and then use
it on production:

- Development
- Staging
- Production

## Requesting Your Credentials

Credentials are provided on request by Canopy to yourselves. Please speak to your account manager here to obtain the details for the environments.

## Requesting an API Token

You need to request an API token to make calls to the Canopy API. In order to do this you need to:

1. Generate a payload using the clientId from the credentials you have been sent. The example here uses Javascript:

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


## Refresh Secret Key

Requires authorization. This endpoint may be called to change current `secretKey` and get back freshly generated one. Accepts currently active `secretKey` in request body. After receiving successful response with new `secretKey`, previous `secretKey` becomes stale and should not be used for generation `jwtKey`.

```
POST /referencing-requests/client/refresh
```

Request body:

```
secretKey: string;
```

Response body:

```
secretKey: string;
```

## Prefill User's Rent Passport with Existing Data

If you already have some user information, such as identity, income and (or) rent, you can send it Canopy, so we will prefill the user's Rent Passport with provided data.

### Set Identity

```
POST /referencing-requests/client-user-data/set-identity
```

Request Body

```
email: string (required)
firstName: string (required)
middleName: string (optional)
lastName: string (required)
dateOfBirth: string (required, date format YYYY-MM-DD)
phone: string (required)
addresses: [ /* an array of addresses, each of them in the following format */
  {
    startDate: string (required)
    flat: string (optional)
    houseNumber: string (required if houseName is not present)
    houseName: string (required of houseNumber is not present)
    street: string (required)
    countryCode: string (required)
    county: string (optional)
    town: string (required)
    postCode: string (required),
    line1: string (optional)
    line2: string (optional)
    line3: string (optional)
  }
]
```

Response Body

```
email: string;
firstName: string;
lastName: string;
dateOfBirth: ISODate;
phone: string;
addresses - array of provided addresses;
middleName: string (optional);
```

### Set Income

```
POST /referencing-requests/client-user-data/set-income
```

Request Body

```
email: string, (required);
data: { /* required field with the following structure: */
  income: required array of income objects, minimum 1 item;
}
```

The objects inside the "income" array from the above request body can be any of the following:

- "EMPLOYED" type 
  ```
  incomeSource: "EMPLOYED", required
  annualSalary: number, required
  paymentFrequency: string, one of ["MONTHLY", "TWO_WEEKLY", "WEEKLY"], required
  additionalInfo: string, required
  employment: {
    companyName: string, required
    jobTitle: string, required
    employmentStatus: string, one of ["FULL_TIME", "PART_TIME"], required
    employmentBasis: string, one of ["PERMANENT", "CONTRACT"], required
    startDate: string, date format YYYY-MM-DD, required
  }
  ```

- "SELF_EMPLOYED" type
  ```
  incomeSource: "SELF_EMPLOYED", required
  annualSalary: number, required
  paymentFrequency: string, one of ["MONTHLY", "TWO_WEEKLY", "WEEKLY"], required
  additionalInfo: string, required,
  employment: {
    incomeName: string, required
    jobTitle: string, required
    startDate: string, date format YYYY-MM-DD, required
  }
  ```

- "STUDENT" type
  ```
    incomeSource: "STUDENT", required
    annualSalary: number, required
    paymentFrequency: string, one of ["MONTHLY", "TWO_WEEKLY", "WEEKLY"], required
    additionalInfo: string, required,
    employment: {
      educationalInstitutionName: string, required
      grantsAvailability: boolean, required
      startDate: string, date format YYYY-MM-DD, required if grantsAvailability is true
    }
  ```

- "RETIRED", "UNEMPLOYED", "BENEFITS" or "OTHER" type
  ```
    incomeSource: string, ["RETIRED", "UNEMPLOYED", "BENEFITS", "OTHER"], required
    annualSalary: number, required
    paymentFrequency: string, ["MONTHLY", "TWO_WEEKLY", "WEEKLY"], required
    additionalInfo: string, required,
    employment: {
      incomeName: string, required
      description: string, required
      startDate: string, date format YYYY-MM-DD, required
    }
  ```


Response Body

```
clientId: uuid;
email: string;
income: [ /* array of objects, each of them has the following structure */
  {
    incomeSource: string, one of ["EMPLOYED", "SELF_EMPLOYED", "STUDENT", "RETIRED", "UNEMPLOYED", "BENEFITS", "OTHER", "NO_INCOME"];
    annualSalary: number;
    paymentFrequency: string, one of ["MONTHLY", "TWO_WEEKLY", "WEEKLY", "OTHER"];
    additionalInfo: string, optional;
    employment: object, can take one of the schemas below;
  }
]
```

The "employment" field from the above response can be one of the following:

- 
  ```
  Employed {
    companyName: string;
    jobTitle: string;
    employmentStatus: string, one of ["FULL_TIME", "PART_TIME"];
    employmentBasis: string, one of ["PERMANENT", "CONTRACT"];
    startDate: Date;
  }
  ```

- 
  ```
  SelfEmployed {
    incomeName: string;
    jobTitle: string;
    startDate: Date;
  }
  ```

-
  ```
  Student {
    educationalInstitutionName: string;
    grantsAvailability: boolean;
    startDate?: Date;
  }
  ```

- 
  ```
  Retired {
    incomeName: string;
    description: string;
    startDate: Date;
  }
  ```

-
  ```
  Unemployed {
    incomeName: string;
    description: string;
    startDate: Date;
  }
  ```

-
  ```
  Benefits {
    incomeName: string;
    description: string;
    startDate: Date;
  }
  ```

-
  ```
  Other {
    incomeName: string;
    description: string;
    startDate: Date;
  }
  ```

### Set Rent

```
POST /referencing-requests/client-user-data/set-rent
```

Request Body

```
email: string, required,
data: {
  homeowner: boolean, required
  rentsDuringLastYear: boolean, required
  rents: [ required if rentsDuringLastYear == true, minimum 1 item
    {
      name: string, required
      paymentFrequency: string, one of ["MONTHLY", "TWO_WEEKLY", "WEEKLY"], required
      rentPaymentAmount: number, required
      rentPaidTo: string, required
    }
  ]
}
```

Response Body

```
clientId: uuid;
email: string;
rentData: {
  homeowner: boolean;
  rentsDuringLastYear: boolean;
  rents: [ /* optional field */
    {
      name: string;
      paymentFrequency: string, one of ["MONTHLY", "TWO_WEEKLY", "WEEKLY"];
      rentPaymentAmount: number;
      rentPaidTo: string;
    }
  ];
```


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
```
email: string (required),
firstName: string (optional),
middleName: string (optional),
lastName: string (optional),
callbackUrl: string (required) - URL to which Canopy will send PDF Report,
requestType: enum (required) - one of [RENTER_SCREENING, GUARANTOR_SCREENING],
itemType: enum (required) - one of [INSTANT, FULL],
title: string (optional) - it's a title used before a surname or full name,
phone: string (optional),
branchId: string (optional) - this is an identifier of the client's branch which requests the user,
clientReferenceId: string (optional) - this is unique identifier on the client's side
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

### Rent Passport Retrieval

Once referencing has been completed by the renter in the Canopy mobile application, an update message will be sent to the `callbackUrl` provided at the moment of referencing request. This message will have the following structure:

```
clientReferenceId: string,
canopyReferenceId: uuid,
document: {
  documentType: enum - one of [0, 1]; /* 0 means INSTANT screening type, 1 means FULL screening type */
  url: `/referencing-requests/client/:clientId/documents/:documentId`,
  maxRent: number,
  status: string,
  title: enum - one of [INSTANT, FULL]
}
```

To retrieve a PDF Rent Passport after successful referencing completion, you can use the `url` field from the above response:

```
GET /referencing-requests/client/:clientId/documents/:documentId
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

## Webhooks Endpoints

### Register Webhook

The endpoint below registers the webhook with the appropriate type in Canopy system. After that, Rent Passport updates will be sent to the specified callback url.

```
POST /referencing-requests/client/:clientId/webhook/register
```

Parameters:

```
clientId: your client reference
```

Request body:

```
type: string (required) - scpecifies which type of updates will be sent from Canopy, one of ["PASSPORT_STATUS_UPDATES", "REQUEST_STATUS_UPDATES"];
callbackUrl: string (required) - the URL of the webhook endpoint;
additionalSettings: string[] (optional) - list of Rent Passport sections for which updates will be sent; 
  - This field should only be added in case "PASSPORT_STATUS_UPDATES" webhook type is specified. 
  - The following sections can be specified inside the array: ["INCOME", "RENT", "CREDIT_CHECK", "SAVINGS", "RENTAL_PREFERENCES", "EMPLOYEE_REFERENCE", "LANDLORD_REFERENCE"]
  - There is no need to explicitly specify the names of all sections if you want to receive all updates. Just send an empty array - []. 
```

Successful response body:

```
"success": true,
"webhookType": string,
"callbackUrl": string
```

If you subscribed to the `REQUEST_STATUS_UPDATES` type, the updates will be sent to the `callbackUrl` each time one of the following events trigger:

- `INVITED` - the user was invited to connect;

- `INVITE_RESENT` - resent invitation email for the user;

- `CONNECTED` - user accepts the connection;

- `CONNECTION_REJECTED` - user rejects the connection;

- `CONNECTION_STOPPED` - user stops the connection;

- `SENDING_COMPLETED_PASSPORT_FAILED` - sending the completed passport to client failed;

- `PASSPORT_COMPLETED` - `user complete his passport and the document was sent;

- `INVALID_APPLICATION_DETAILS` - client's request body with application details was invalid;


Once `REQUEST_STATUS_UPDATES` event trigger, the Canopy should sent the notification to `callbackUrl` in the following format:

```
canopyReferenceId: uuid,
clientReferenceId: string,
notes: string,
```

If you are subscribed to the `PASSPORT_STATUS_UPDATES` type, the updates will be sent to the `callbackUrl` when one of the following Rent Passport sections is updated (if updates for this section requested):

- `CREDIT CHECK`

- `INCOME`

- `RENT`

- `SAVINGS`

- `LANDLORD REFERENCE` - optional, only if FULL SCREENING requested;

- `EMPLOYER REFERENCE` - optional, only if FULL SCREENING requested;


Once `PASSPORT_STATUS_UPDATES` event trigger, the Canopy should sent the notification to `callbackUrl` in the following format:

```
canopyReferenceId: uuid,
clientReferenceId: uuid,
updatedSection: {
  type: enum - one of [INCOME, RENT, CREDIT_CHECK, SAVINGS, EMPLOYEE_REFERENCE, LANDLORD_REFERENCE],
  newStatus: enum - one of [NOT_STARTED, IN_PROGRESS, DONE],
  updatedAt: ISODateTime,
},
instant: {
  status: enum - one of [NOT_STARTED, IN_PROGRESS, ACCEPT, CONSIDER, HIGH_RISK],
  sections: {
    income: enum - one of [NOT_STARTED, IN_PROGRESS, DONE],
    rent: enum - one of [NOT_STARTED, IN_PROGRESS, DONE],
    creditCheck: enum - one of [NOT_STARTED, IN_PROGRESS, DONE],
    savings: enum - one of [NOT_STARTED, IN_PROGRESS, DONE],
  };
};
full: { /* optional field, sent only if FULL SCREENING requested  */
  status: enum - one of [NOT_STARTED, IN_PROGRESS, ACCEPT, CONSIDER, HIGH_RISK],
  sections: {
    employerReference: enum - one of [NOT_STARTED, IN_PROGRESS, DONE],
    landlordReference: enum - one of [NOT_STARTED, IN_PROGRESS, DONE],
  };
};
globalStatus: enum - one of [NOT_STARTED, IN_PROGRESS, ACCEPT, CONSIDER, HIGH_RISK],
```

### Unregister Webhook

The endpoint below unregisters webhook and stops sending Rent Passport updates to the specified callback URL.

```
DELETE /referencing-requests/client/:clientId/webhook/:webhookType
```

Parameters:

```
clientId: your client reference,
webhookType: the type of the webhook you want to unregister
```

Successful response body:

```
"success": true,
"webhookType": string
```

Unsuccessful response body:

```
/* If you don't have webhook subscriptions of the specified type */

"success": false,
"requestId" — the identifier of the request,
"error": {
  "status": 404,
  "type" — error type,
  "message" — “No webhooks of the specified type found”,
}
```

## Errors

We use conventional HTTP response codes to indicate the success or failure of an API request, typically one of:

- 2xx - indicate success
- 4xx - indicate a client error with information provided (missign required parameters etc..)
- 5xx - indicate an error with the Canopy platform

We suggest you wrap 4xx errors in your client and provide a user friendly message to your end users as part of the integration.
