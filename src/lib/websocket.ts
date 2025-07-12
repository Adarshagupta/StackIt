import { ServerIO } from '@/pages/api/socket'

// Global variable to store the Socket.IO instance
let io: ServerIO | null = null

export const setSocketIO = (socketIO: ServerIO) => {
  io = socketIO
}

export const getSocketIO = () => io

// Event types for WebSocket messages
export interface WebSocketEvent {
  type: 'VOTE_UPDATE' | 'NEW_ANSWER' | 'ANSWER_ACCEPTED' | 'QUESTION_UPDATED' | 'ANSWER_UPDATED' | 'QUESTION_DELETED' | 'ANSWER_DELETED'
  payload: any
  timestamp: Date
}

// Broadcasting functions
export const broadcastVoteUpdate = (questionId: string, data: {
  targetId: string
  targetType: 'question' | 'answer'
  voteCount: number
  userVote: 'UP' | 'DOWN' | null
}) => {
  if (!io) return

  const event: WebSocketEvent = {
    type: 'VOTE_UPDATE',
    payload: data,
    timestamp: new Date()
  }

  // Broadcast to question-specific room
  io.to(`question-${questionId}`).emit('vote-update', event)
  
  // Also broadcast to global room for homepage updates
  io.to('global').emit('vote-update', event)
}

export const broadcastNewAnswer = (questionId: string, answer: any) => {
  if (!io) return

  const event: WebSocketEvent = {
    type: 'NEW_ANSWER',
    payload: answer,
    timestamp: new Date()
  }

  // Broadcast to question-specific room
  io.to(`question-${questionId}`).emit('new-answer', event)
  
  // Also broadcast to global room
  io.to('global').emit('new-answer', event)
}

export const broadcastAnswerAccepted = (questionId: string, data: {
  answerId: string
  isAccepted: boolean
}) => {
  if (!io) return

  const event: WebSocketEvent = {
    type: 'ANSWER_ACCEPTED',
    payload: data,
    timestamp: new Date()
  }

  // Broadcast to question-specific room
  io.to(`question-${questionId}`).emit('answer-accepted', event)
}

export const broadcastQuestionUpdated = (questionId: string, question: any) => {
  if (!io) return

  const event: WebSocketEvent = {
    type: 'QUESTION_UPDATED',
    payload: question,
    timestamp: new Date()
  }

  // Broadcast to question-specific room
  io.to(`question-${questionId}`).emit('question-updated', event)
  
  // Also broadcast to global room
  io.to('global').emit('question-updated', event)
}

export const broadcastAnswerUpdated = (questionId: string, answer: any) => {
  if (!io) return

  const event: WebSocketEvent = {
    type: 'ANSWER_UPDATED',
    payload: answer,
    timestamp: new Date()
  }

  // Broadcast to question-specific room
  io.to(`question-${questionId}`).emit('answer-updated', event)
}

export const broadcastQuestionDeleted = (questionId: string) => {
  if (!io) return

  const event: WebSocketEvent = {
    type: 'QUESTION_DELETED',
    payload: { questionId },
    timestamp: new Date()
  }

  // Broadcast to question-specific room
  io.to(`question-${questionId}`).emit('question-deleted', event)
  
  // Also broadcast to global room
  io.to('global').emit('question-deleted', event)
}

export const broadcastAnswerDeleted = (questionId: string, answerId: string) => {
  if (!io) return

  const event: WebSocketEvent = {
    type: 'ANSWER_DELETED',
    payload: { answerId },
    timestamp: new Date()
  }

  // Broadcast to question-specific room
  io.to(`question-${questionId}`).emit('answer-deleted', event)
} 