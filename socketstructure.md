 Socket {
        connected: true,
        recovered: undefined,
        receiveBuffer: [],
        sendBuffer: [],
        _queue: [],
        _queueSeq: 0,
        ids: 0,
        acks: {},
        flags: {},
        io: Manager {
          nsps: [Object],
          subs: [Array],
          opts: [Object],
          setTimeoutFn: [Function: bound setTimeout],
          clearTimeoutFn: [Function: bound clearTimeout],
          _reconnection: true,
          _reconnectionAttempts: Infinity,
          _reconnectionDelay: 1000,
          _reconnectionDelayMax: 5000,
          _randomizationFactor: 0.5,
          backoff: [Backoff],
          _timeout: 20000,
          _readyState: 'open',
          uri: 'http://localhost:40219',
          encoder: [Encoder],
          decoder: [Decoder],
          _autoConnect: true,
          engine: [Socket],
          skipReconnect: false,
          _callbacks: [Object]
        },
        nsp: '/',
        _opts: {
          path: '/socket.io',
          hostname: 'localhost',
          secure: false,
          port: '40219'
        },
        subs: [
          [Function: subDestroy],
          [Function: subDestroy],
          [Function: subDestroy],
          [Function: subDestroy]
        ],
        _callbacks: { '$connect': [Array] },
        id: 'iM6iVme9A3c-pMejAAAD',
        _pid: undefined
      }