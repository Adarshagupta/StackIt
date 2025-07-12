import { NextApiRequest, NextApiResponse } from 'next'
import { Server as ServerIO } from 'socket.io'
import { Server as NetServer } from 'http'
import { Socket as NetSocket } from 'net'
import { setSocketIO } from '@/lib/websocket'

interface SocketServer extends NetServer {
  io?: ServerIO | undefined
}

interface SocketWithIO extends NetSocket {
  server: SocketServer
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (res.socket.server.io) {
    console.log('Socket.IO already running')
    res.end()
    return
  }

  console.log('Starting Socket.IO server...')
  
  const io = new ServerIO(res.socket.server, {
    path: '/api/socket',
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  })

  res.socket.server.io = io
  setSocketIO(io)

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    // Join question-specific rooms
    socket.on('join-question', (questionId: string) => {
      socket.join(`question-${questionId}`)
      console.log(`Client ${socket.id} joined question-${questionId}`)
    })

    // Leave question-specific rooms
    socket.on('leave-question', (questionId: string) => {
      socket.leave(`question-${questionId}`)
      console.log(`Client ${socket.id} left question-${questionId}`)
    })

    // Join global rooms for homepage updates
    socket.on('join-global', () => {
      socket.join('global')
      console.log(`Client ${socket.id} joined global room`)
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })

  console.log('Socket.IO server started')
  res.end()
}

export { type ServerIO } 