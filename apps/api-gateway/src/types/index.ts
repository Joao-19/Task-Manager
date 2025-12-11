import { Request } from 'express';
import type { TaskStatus, TaskPriority } from '@repo/dtos';

/**
 * Authenticated request interface
 * Extends Express Request with JWT user payload
 */
export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

/**
 * JWT payload structure
 */
export interface JwtPayload {
  userId: string;
  email: string;
  sub: string;
  username?: string; // Optional username from JWT
}

/**
 * Task filters for querying tasks
 * Using @repo/dtos enums for status and priority
 */
export interface TaskFilters {
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
  page?: number;
  limit?: number;
}

/**
 * History filters for querying task history
 */
export interface HistoryFilters {
  page?: number;
  limit?: number;
}

/**
 * Comment filters for querying comments
 */
export interface CommentFilters {
  page?: number;
  limit?: number;
}

/**
 * History item (from tasks-service)
 */
export interface HistoryItem {
  id: string;
  taskId: string;
  userId: string;
  fieldChanged: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: Date;
}

/**
 * Comment item (from tasks-service)
 */
export interface CommentItem {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: Date;
}

/**
 * User (from users-service)
 */
export interface User {
  id: string;
  username: string;
  email: string;
}

/**
 * Enriched history item with user data
 */
export interface EnrichedHistoryItem extends HistoryItem {
  user?: User;
}

/**
 * Enriched comment item with user data
 */
export interface EnrichedCommentItem extends CommentItem {
  user?: User;
}

// Re-export error types
export * from './errors';
