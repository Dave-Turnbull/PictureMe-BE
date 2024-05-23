Socket events:

'connection'- (handshake, server listening) { server will check if socket has userID, if not generates one, if so will push user to existing game}
'getUserID'- (first event to retrieve randomly generated userID) { input: none, recieved-format: 'string'}
'createRoom'-(host creates room, gets roomObj back){ input: {userID: 'userID', username: 'username'}, recieved-format: 'string'}
'joinRoom'-(){ input: none, recieved-format: 'string'}
'startGame'-(){ input: none, recieved-format: 'string'}
'leaveRoom'-(){ input: none, recieved-format: 'string'}
'imageUpload'-(){ input: none, recieved-format: 'string'}
