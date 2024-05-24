Socket events:

roomObj = {
roomID: 'mockRoomID',
host: { userID: 'userID', username: 'user1' },
users: [ { userID: 'userID', username: 'user1' }, { userID: 'userID', username: 'user2' } ],
game: {
players: [ { userID: 'userID', username: 'user1', score: 0 }, { userID: 'userID', username: 'user2', score: 0 } ],
rounds: {
'1': {
instructions: undefined,
roundImages: [{
userID: 'userId',
img: ''
votes: Num
},
{
userID: 'userID' ,
img: ''
votes: Num
} ]
}
} } }

imageObj = {
user: { userID: 'userID', username: 'user1' },
imgdata: 'buffer',
votes: Num
}

'connection'

- handshake, server listening
- server will check if socket has userID, if not generates one, if so will push user to existing game

'getUserID'

- first event to retrieve randomly generated userID
- takes: none
- sends: 'userID'

'createRoom'

- host creates room, gets roomObj back
- takes: {userID: 'userID', username: 'username'}
- sends: {res: 'room created', roomObj}

'joinRoom'

- takes: {username: 'username', roomID: 'roomID'}
- sends: {res: 'joined', roomObj}

'startGame'

- takes: {roomID: 'roomID'}
- sends: {res: 'game started', roundData: 'something red'}

'imageUpload'

- takes: { roomID: 'roomID', imageData: { userID:'userID', img: "imagedata", votes: 0 } }
- sends: {res: 'file uploaded'}
- Listen for event: 'submissionEnd', FE recieves: [{ userID: 'userID', { img: "imagedata", votes: 0 } }, { userID: 'userID', { img: "imagedata", votes: 0 } }]

'userVote'

- takes: {roomID: 'roomID', userScore: { userID: 'senderID', score: 'score'}, imgTakerID: 'takerID'}
- sends: ( to everyone ) event - 'userVoted'

'leaveRoom'

- takes: 'roomID'
- sends: 'string'
