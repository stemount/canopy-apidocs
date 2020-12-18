# Errors

We use conventional HTTP response codes to indicate the success or failure of an API request, typically one of:

| Error Code | Meaning                                                                                |
| ---------- | -------------------------------------------------------------------------------------- |
| 2xx        | Indicates success                                                                      |
| 4xx        | Indicates a client error with information provided (missign required parameters etc..) |
| 5xx        | Indicates an error with the Canopy platform                                            |

We suggest you wrap 4xx errors in your client and provide a user friendly message to your end users as part of the integration.
