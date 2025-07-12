import { Role } from '@/lib/auth'

// User types
export interface User {
  id: string
  email: string
  username: string
  firstName: string | null
  lastName: string | null
  avatar: string | null
  bio: string | null
  role: Role
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UserWithStats extends User {
  _count: {
    questions: number
    answers: number
    votes: number
  }
}

// Question types
export interface Question {
  id: string
  title: string
  content: string
  isAnswered: boolean
  viewCount: number
  voteCount: number
  answerCount: number
  createdAt: Date
  updatedAt: Date
  authorId: string
  author: User
  tags: QuestionTag[]
  answers?: Answer[]
  votes?: Vote[]
}

export interface QuestionWithDetails extends Question {
  answers: Answer[]
  votes: Vote[]
  _count: {
    answers: number
    votes: number
    views: number
  }
}

// Answer types
export interface Answer {
  id: string
  content: string
  isAccepted: boolean
  voteCount: number
  createdAt: Date
  updatedAt: Date
  questionId: string
  authorId: string
  author: User
  votes?: Vote[]
  comments?: Comment[]
}

export interface AnswerWithDetails extends Answer {
  votes: Vote[]
  comments: Comment[]
  _count: {
    votes: number
    comments: number
  }
}

// Tag types
export interface Tag {
  id: string
  name: string
  description: string | null
  color: string | null
  createdAt: Date
  _count?: {
    questions: number
  }
}

export interface QuestionTag {
  id: string
  questionId: string
  tagId: string
  tag: Tag
}

// Vote types
export interface Vote {
  id: string
  type: 'UP' | 'DOWN'
  userId: string
  user: User
  questionId: string | null
  answerId: string | null
  createdAt: Date
}

// Comment types
export interface Comment {
  id: string
  content: string
  createdAt: Date
  updatedAt: Date
  authorId: string
  author: User
  questionId: string | null
  answerId: string | null
}

// Notification types
export interface Notification {
  id: string
  type: 'NEW_ANSWER' | 'NEW_COMMENT' | 'MENTION' | 'VOTE' | 'QUESTION_ACCEPTED'
  title: string
  message: string
  isRead: boolean
  data: Record<string, any> | null
  createdAt: Date
  userId: string
  senderId: string | null
  sender: User | null
  questionId: string | null
  answerId: string | null
  commentId: string | null
}

// Report types
export interface Report {
  id: string
  reason: string
  details: string | null
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED'
  createdAt: Date
  updatedAt: Date
  reportedById: string
  reportedBy: User
  moderatedById: string | null
  moderatedBy: User | null
  questionId: string | null
  answerId: string | null
  commentId: string | null
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T = any> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface ApiError {
  message: string
  statusCode: number
  errors?: Record<string, string[]>
}

// Search and Filter types
export interface SearchParams {
  q?: string
  tags?: string[]
  author?: string
  sortBy?: 'recent' | 'votes' | 'answers' | 'views'
  order?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface FilterOptions {
  tags: Tag[]
  authors: User[]
  sortOptions: {
    value: string
    label: string
  }[]
}

// Form types
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  email: string
  username: string
  firstName: string
  lastName: string
  password: string
  confirmPassword: string
}

export interface QuestionForm {
  title: string
  content: string
  tags: string[]
}

export interface AnswerForm {
  content: string
}

export interface CommentForm {
  content: string
}

export interface ProfileForm {
  firstName: string
  lastName: string
  bio?: string
}

export interface TagForm {
  name: string
  description?: string
  color?: string
}

// Component Props types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'search'
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  error?: string
  disabled?: boolean
  required?: boolean
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

// Editor types
export interface EditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
  readOnly?: boolean
}

// WebSocket types
export interface WebSocketMessage {
  type: 'NOTIFICATION' | 'QUESTION_UPDATE' | 'ANSWER_UPDATE' | 'VOTE_UPDATE'
  payload: any
  timestamp: Date
}

export interface NotificationPayload {
  notification: Notification
  userId: string
}

export interface QuestionUpdatePayload {
  questionId: string
  type: 'NEW_ANSWER' | 'VOTE_UPDATE' | 'COMMENT_UPDATE'
  data: any
}

// Admin Dashboard types
export interface DashboardStats {
  totalUsers: number
  totalQuestions: number
  totalAnswers: number
  totalVotes: number
  activeUsers: number
  questionsToday: number
  answersToday: number
  topTags: Array<{
    name: string
    count: number
  }>
}

export interface SystemSettings {
  siteName: string
  siteDescription: string
  maxQuestionsPerDay: number
  maxAnswersPerQuestion: number
  allowAnonymousQuestions: boolean
  requireEmailVerification: boolean
}

// File Upload types
export interface FileUploadResult {
  url: string
  filename: string
  size: number
  type: string
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

// Utility types
export type SortOrder = 'asc' | 'desc'
export type ContentType = 'question' | 'answer' | 'comment'
export type VoteType = 'UP' | 'DOWN'
export type NotificationType = 'NEW_ANSWER' | 'NEW_COMMENT' | 'MENTION' | 'VOTE' | 'QUESTION_ACCEPTED'

// Database query types
export interface QueryOptions {
  select?: Record<string, boolean>
  include?: Record<string, boolean | QueryOptions>
  where?: Record<string, any>
  orderBy?: Record<string, SortOrder>
  skip?: number
  take?: number
}

// Authentication types
export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginForm) => Promise<void>
  register: (userData: RegisterForm) => Promise<void>
  logout: () => void
  updateProfile: (data: ProfileForm) => Promise<void>
  refreshToken: () => Promise<void>
}

// Theme types
export interface ThemeConfig {
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
  muted: string
  border: string
  input: string
  card: string
  popover: string
  destructive: string
  success: string
  warning: string
  info: string
}

// Event types
export interface CustomEvent<T = any> {
  type: string
  payload: T
  timestamp: Date
}

// Middleware types
export interface MiddlewareContext {
  req: Request
  res: Response
  user?: User
  params?: Record<string, string>
  query?: Record<string, string>
}

export interface NextApiRequestWithUser extends Request {
  user?: User
}

export type MiddlewareFunction = (
  context: MiddlewareContext
) => Promise<void> | void

// Error handling types
export interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: any
}

export interface ErrorLogEntry {
  message: string
  stack: string
  timestamp: Date
  userId?: string
  url: string
  userAgent: string
} 