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

// FE events://

'connection'

- handshake, server listening
- server will check if socket has userID, if not generates one, if so will push user to existing game

'getUserID'

- first event to retrieve randomly generated userID
- Server takes: none
- Server sends: 'userID'

'createRoom'

- host creates room, gets roomObj back
- Server takes: {userID: 'userID', username: 'username'}
- Server sends: {res: 'room created', roomObj}

'joinRoom'

- Server takes: {username: 'username', roomID: 'roomID'}
- Server sends: {res: 'joined', data: [{userID: 'userID', username: 'username'} ...etc]}

Everyone is emitted 'updateUsersArray', sends same array above.

'startGame'

- Server takes:
- Server sends: 'game started'

Everyone is emitted 'startRound', sends instruction string for users like ... 'something ...'

'imageUpload'

- Server takes: { imageData: { userID:'userID', img: "imagedata"} }
- Server sends: 'image uploaded'

Everyone is emitted 'userPictureSubmitted', sends 'user submitted'
If everyone has submitted a photo, listen for 'startVotes'. sends {img: 'buffer', userID: 'imgTakerID'}

'userVote'

- Server takes: {voteData: { userID: 'senderID', score: 'score'}, imgUserID: 'userID'}
- Server sends: 'vote counted'

Everyone is emitted 'userVoted', sends 'user voted'
If all players voted then listen for 'nextImage'. sends {img: 'buffer', userID: 'imgTakerID'}
If all all images have been voted on listen for 'endRound'. sends [ { userID: 'userID', username: 'user1', score: 0 }, { userID: 'userID', username: 'user2', score: 0 } ] for leaderboard

'continueGame'

- Server takes:
- Server sends: "game continuing" triggers "newRound"

'endGame'

-Server takes:
-Server sends: (to host)"thanks for playing!" (to everyone){ Game Data }
