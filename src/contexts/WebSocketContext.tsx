'use client'

import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

interface WebSocketEvent {
  type: 'VOTE_UPDATE' | 'NEW_ANSWER' | 'ANSWER_ACCEPTED' | 'QUESTION_UPDATED' | 'ANSWER_UPDATED' | 'QUESTION_DELETED' | 'ANSWER_DELETED'
  payload: unknown
  timestamp: Date
}

interface WebSocketContextType {
  socket: Socket | null
  isConnected: boolean
  connectionError: string | null
  joinQuestion: (questionId: string) => void
  leaveQuestion: (questionId: string) => void
  joinGlobal: () => void
  onVoteUpdate: (callback: (event: WebSocketEvent) => void) => () => void
  onNewAnswer: (callback: (event: WebSocketEvent) => void) => () => void
  onAnswerAccepted: (callback: (event: WebSocketEvent) => void) => () => void
  onQuestionUpdated: (callback: (event: WebSocketEvent) => void) => () => void
  onAnswerUpdated: (callback: (event: WebSocketEvent) => void) => () => void
  onQuestionDeleted: (callback: (event: WebSocketEvent) => void) => () => void
  onAnswerDeleted: (callback: (event: WebSocketEvent) => void) => () => void
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
}

interface WebSocketProviderProps {
  children: React.ReactNode
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const eventCallbacks = useRef<{
    voteUpdate: ((event: WebSocketEvent) => void)[]
    newAnswer: ((event: WebSocketEvent) => void)[]
    answerAccepted: ((event: WebSocketEvent) => void)[]
    questionUpdated: ((event: WebSocketEvent) => void)[]
    answerUpdated: ((event: WebSocketEvent) => void)[]
    questionDeleted: ((event: WebSocketEvent) => void)[]
    answerDeleted: ((event: WebSocketEvent) => void)[]
  }>({
    voteUpdate: [],
    newAnswer: [],
    answerAccepted: [],
    questionUpdated: [],
    answerUpdated: [],
    questionDeleted: [],
    answerDeleted: []
  })

  useEffect(() => {
    // Initialize WebSocket connection
    const initializeSocket = async () => {
      try {
        console.log('Initializing WebSocket connection...')
        
        // Wait a bit for the server to start (if needed)
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Then connect to it
        const newSocket = io({
          path: '/api/socket',
          transports: ['websocket', 'polling'],
          timeout: 20000,
          autoConnect: true,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
        })

        newSocket.on('connect', () => {
          console.log('WebSocket connected:', newSocket.id)
          setIsConnected(true)
          setConnectionError(null)
        })

        newSocket.on('disconnect', (reason) => {
          console.log('WebSocket disconnected:', reason)
          setIsConnected(false)
          if (reason === 'io server disconnect') {
            // Server disconnected, try to reconnect
            newSocket.connect()
          }
        })

        newSocket.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error)
          setConnectionError(`Connection failed: ${error.message}`)
          setIsConnected(false)
        })

        newSocket.on('reconnect', (attemptNumber) => {
          console.log('WebSocket reconnected after', attemptNumber, 'attempts')
          setIsConnected(true)
          setConnectionError(null)
        })

        newSocket.on('reconnect_error', (error) => {
          console.error('WebSocket reconnection error:', error)
          setConnectionError(`Reconnection failed: ${error.message}`)
        })

        newSocket.on('reconnect_failed', () => {
          console.error('WebSocket reconnection failed')
          setConnectionError('Unable to reconnect to server')
        })

        // Set up event listeners
        newSocket.on('vote-update', (event: WebSocketEvent) => {
          eventCallbacks.current.voteUpdate.forEach(callback => callback(event))
        })

        newSocket.on('new-answer', (event: WebSocketEvent) => {
          eventCallbacks.current.newAnswer.forEach(callback => callback(event))
        })

        newSocket.on('answer-accepted', (event: WebSocketEvent) => {
          eventCallbacks.current.answerAccepted.forEach(callback => callback(event))
        })

        newSocket.on('question-updated', (event: WebSocketEvent) => {
          eventCallbacks.current.questionUpdated.forEach(callback => callback(event))
        })

        newSocket.on('answer-updated', (event: WebSocketEvent) => {
          eventCallbacks.current.answerUpdated.forEach(callback => callback(event))
        })

        newSocket.on('question-deleted', (event: WebSocketEvent) => {
          eventCallbacks.current.questionDeleted.forEach(callback => callback(event))
        })

        newSocket.on('answer-deleted', (event: WebSocketEvent) => {
          eventCallbacks.current.answerDeleted.forEach(callback => callback(event))
        })

        setSocket(newSocket)
      } catch (error) {
        console.error('Failed to initialize WebSocket:', error)
        setConnectionError(`Failed to initialize WebSocket: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    initializeSocket()

    return () => {
      if (socket) {
        console.log('Cleaning up WebSocket connection')
        socket.disconnect()
      }
    }
  }, [])

  const joinQuestion = (questionId: string) => {
    if (socket && isConnected) {
      socket.emit('join-question', questionId)
    }
  }

  const leaveQuestion = (questionId: string) => {
    if (socket && isConnected) {
      socket.emit('leave-question', questionId)
    }
  }

  const joinGlobal = () => {
    if (socket && isConnected) {
      socket.emit('join-global')
    }
  }

  const onVoteUpdate = (callback: (event: WebSocketEvent) => void) => {
    eventCallbacks.current.voteUpdate.push(callback)
    
    // Return cleanup function
    return () => {
      eventCallbacks.current.voteUpdate = eventCallbacks.current.voteUpdate.filter(cb => cb !== callback)
    }
  }

  const onNewAnswer = (callback: (event: WebSocketEvent) => void) => {
    eventCallbacks.current.newAnswer.push(callback)
    
    return () => {
      eventCallbacks.current.newAnswer = eventCallbacks.current.newAnswer.filter(cb => cb !== callback)
    }
  }

  const onAnswerAccepted = (callback: (event: WebSocketEvent) => void) => {
    eventCallbacks.current.answerAccepted.push(callback)
    
    return () => {
      eventCallbacks.current.answerAccepted = eventCallbacks.current.answerAccepted.filter(cb => cb !== callback)
    }
  }

  const onQuestionUpdated = (callback: (event: WebSocketEvent) => void) => {
    eventCallbacks.current.questionUpdated.push(callback)
    
    return () => {
      eventCallbacks.current.questionUpdated = eventCallbacks.current.questionUpdated.filter(cb => cb !== callback)
    }
  }

  const onAnswerUpdated = (callback: (event: WebSocketEvent) => void) => {
    eventCallbacks.current.answerUpdated.push(callback)
    
    return () => {
      eventCallbacks.current.answerUpdated = eventCallbacks.current.answerUpdated.filter(cb => cb !== callback)
    }
  }

  const onQuestionDeleted = (callback: (event: WebSocketEvent) => void) => {
    eventCallbacks.current.questionDeleted.push(callback)
    
    return () => {
      eventCallbacks.current.questionDeleted = eventCallbacks.current.questionDeleted.filter(cb => cb !== callback)
    }
  }

  const onAnswerDeleted = (callback: (event: WebSocketEvent) => void) => {
    eventCallbacks.current.answerDeleted.push(callback)
    
    return () => {
      eventCallbacks.current.answerDeleted = eventCallbacks.current.answerDeleted.filter(cb => cb !== callback)
    }
  }

  return (
    <WebSocketContext.Provider
      value={{
        socket,
        isConnected,
        connectionError,
        joinQuestion,
        leaveQuestion,
        joinGlobal,
        onVoteUpdate,
        onNewAnswer,
        onAnswerAccepted,
        onQuestionUpdated,
        onAnswerUpdated,
        onQuestionDeleted,
        onAnswerDeleted
      }}
    >
      {children}
    </WebSocketContext.Provider>
  )
} 