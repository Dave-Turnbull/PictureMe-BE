# Server Events

## getUserID
### Recieves:

callback function

### Responds with:

The current socket's user ID

### Example:

`let receivedUserID = await new Promise((resolve) => {
      socket.emit("getUserID", (userID) => {
        resolve(userID)
      })
    })`