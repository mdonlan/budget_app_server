# Budget App Server

The Budget App Server is the server-side component of the Budget App, a web application that helps users keep track of their budget and expenses. It is built using Node.js, TypeScript, and Express. The server uses Postgres as its database.

The client-side code for the Budget App is available [here](https://github.com/mdonlan/budget_app_client).

## Installation

To install and run the Budget App Server, you will need to have Node.js and npm installed on your machine. You will also need to have Postgres installed and running, and a database set up to store the application data.

1. Clone the repository: `git clone https://github.com/mdonlan/budget_app_server.git`
  
2. Install the dependencies: `npm install`
  
3. Set up the database:

    The schema.sql file in the root of the project contains the SQL statements needed to create the tables for the application. You can use this file to restore the database schema.
  
    For example, if you have a database named "budget_app" on your local Postgres instance, you can run the following command to restore the schema:
  
    `psql budget_app < schema.sql`
  
4. Set up environment variables:
  
    Create a new `.env` file in the root of the project and add the following environment variables:
  
    `PG_PASSWORD="fake_password"` \
    `JWT_SECRET_KEY="fake_secret_key"`
  
    Replace with your Postgres password, and with a secret string that will be used to sign and verify JSON Web Tokens (JWT) for authentication.
  
5. Start the server: `npm start`