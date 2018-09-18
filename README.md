# tournaMINT api

This is a simple tournament api made with nodejs and mongodb

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have node and npm installed

### Starting development server

Follow the instructions below to set up the development environment.
By default the running app can be found at `localhost:3000`.

1. Install npm dependencies:

    ```
    $ npm install
    ```

2. Make sure you have the following env variables set in an .env file in the root of the project:

    ```
    MONGODB_URI
    PORT
    TEST_MONGODB_URI
    TEST_PORT
    SECRET
    ```

3. Then, start the development server:

    ```
    $ npm start
    ```