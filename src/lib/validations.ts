import { z } from 'zod'

// User validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional()
})

// Question validation schemas
export const questionSchema = z.object({
  title: z.string()
    .min(10, 'Title must be at least 10 characters')
    .max(150, 'Title must be less than 150 characters'),
  content: z.string()
    .min(20, 'Content must be at least 20 characters')
    .max(50000, 'Content must be less than 50,000 characters'), // Increased limit for HTML content
  tags: z.array(z.string())
    .min(1, 'At least one tag is required')
    .max(5, 'Maximum 5 tags allowed')
    .refine((tags) => tags.every(tag => tag.length <= 20), {
      message: 'Each tag must be less than 20 characters'
    })
})

export const updateQuestionSchema = z.object({
  title: z.string()
    .min(10, 'Title must be at least 10 characters')
    .max(150, 'Title must be less than 150 characters')
    .optional(),
  content: z.string()
    .min(20, 'Content must be at least 20 characters')
    .max(50000, 'Content must be less than 50,000 characters') // Increased limit for HTML content
    .optional(),
  tags: z.array(z.string())
    .min(1, 'At least one tag is required')
    .max(5, 'Maximum 5 tags allowed')
    .refine((tags) => tags.every(tag => tag.length <= 20), {
      message: 'Each tag must be less than 20 characters'
    })
    .optional()
})

// Answer validation schemas
export const answerSchema = z.object({
  content: z.string()
    .min(20, 'Answer must be at least 20 characters')
    .max(50000, 'Answer must be less than 50,000 characters'), // Increased limit for HTML content
  questionId: z.string().min(1, 'Question ID is required')
})

// Comment validation schemas
export const commentSchema = z.object({
  content: z.string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment must be less than 1,000 characters')
})

// Tag validation schemas
export const tagSchema = z.object({
  name: z.string()
    .min(1, 'Tag name is required')
    .max(20, 'Tag name must be less than 20 characters')
    .regex(/^[a-zA-Z0-9-_]+$/, 'Tag name can only contain letters, numbers, hyphens, and underscores'),
  description: z.string()
    .max(200, 'Description must be less than 200 characters')
    .optional(),
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color')
    .optional()
})

// Search and filter schemas
export const searchSchema = z.object({
  q: z.string().optional(),
  tags: z.array(z.string()).optional(),
  author: z.string().optional(),
  sortBy: z.enum(['recent', 'votes', 'answers', 'views']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional()
})

// Report validation schemas
export const reportSchema = z.object({
  reason: z.string().min(1, 'Reason is required').max(100, 'Reason is too long'),
  details: z.string().max(500, 'Details must be less than 500 characters').optional()
})

// File upload validation
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export const imageUploadSchema = z.object({
  file: z.custom<File>((file) => file instanceof File, {
    message: 'Please select a file'
  }).refine((file) => file.size <= MAX_FILE_SIZE, {
    message: 'File size must be less than 5MB'
  }).refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
    message: 'Only JPEG, PNG, and WebP images are allowed'
  })
})

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10)
})

// Vote schema
export const voteSchema = z.object({
  type: z.enum(['UP', 'DOWN']),
  questionId: z.string().optional(),
  answerId: z.string().optional()
}).refine(data => data.questionId || data.answerId, {
  message: 'Either questionId or answerId is required'
}).refine(data => !(data.questionId && data.answerId), {
  message: 'Cannot vote on both question and answer'
})

// Notification schema
export const notificationSchema = z.object({
  type: z.enum(['NEW_ANSWER', 'NEW_COMMENT', 'MENTION', 'VOTE', 'QUESTION_ACCEPTED']),
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  message: z.string().min(1, 'Message is required').max(500, 'Message is too long'),
  data: z.record(z.string(), z.any()).optional()
}) 