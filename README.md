Socket events:

roomObj = {
  roomID: 'mockRoomID',
  host: { username: 'user1' },
  users: [ { username: 'user1' }, { username: 'user2' } ],
  game: { players: [ { username: 'user1' }, { username: 'user2' } ], rounds: {
  '1': { roundBase: undefined, roundImages: [ { 'user1': { img: "imagedata", votes: 0 } }, { 'user2': { img: "imagedata", votes: 0 } } ] }
} } }

'connection'
 - handshake, server listening
 - server will check if socket has userID, if not generates one, if so will push user to existing game

'getUserID'
- first event to retrieve randomly generated userID
- input: none
- recieved: 'userID'

'createRoom'
- host creates room, gets roomObj back
- input: {userID: 'userID', username: 'username'}
- recieved: {res: 'room created', roomObj}

'joinRoom'
- input: {username: 'username', roomID: 'roomID'}
- recieved: {res: 'joined', roomObj}

'startGame'
- input: {roomID: 'roomID'}
- recieved: {res: 'game started', { round: 'something red', roundImages: [] }}

'imageUpload'
- input: { roomID: 'roomID', imageData: { 'user1': { img: "imagedata", votes: 0 } } }
- recieved: {res: 'file uploaded'}
- Listen for event: 'submissionEnd', FE recieves: [{ 'user1': { img: "imagedata", votes: 0 } }, { 'user2': { img: "imagedata", votes: 0 } }]

'userVote'
- input:
recieved: 

'leaveRoom'
- input: 'roomID'
- recieved: 'string'

{
image1: { 
    user: {},
    imgdata: ''
    votes: Num
}
}