# Email Engine Client

This is the front end for the "Email-engine-core" backend service developed using React.JS. It has two main components:
1. **Login/Signup Page**: Where the user can sign up or log in.
2. **Email Data Page**: Where the user can link their Outlook email, initiate syncing, and receive real-time updates for their emails.

Walkthrough Video: https://www.youtube.com/watch?v=zJ0_yFZK3wo

The client makes a WebSocket connection to the backend to receive real-time updates about the mailbox and email.

## Features

- **User Authentication**: Sign up and log in functionality.
- **Outlook Email Linking**: Link Outlook email through OAuth2.
- **Email Syncing**: Initiate email syncing and receive real-time updates.
- **WebSocket Connection**: Receive real-time updates about the mailbox and email.

## Steps to Run

1. Install dependencies:
    ```
    npm install
    ```
2. Start the development server:
  ```
    npm run dev
    ```