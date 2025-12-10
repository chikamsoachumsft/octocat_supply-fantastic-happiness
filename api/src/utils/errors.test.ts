import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import {
  DatabaseError,
  NotFoundError,
  ValidationError,
  ConflictError,
  handleDatabaseError,
  errorHandler,
} from './errors';

describe('Error Classes', () => {
  describe('DatabaseError', () => {
    it('should create a database error with default values', () => {
      const error = new DatabaseError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('DatabaseError');
    });

    it('should create a database error with custom values', () => {
      const error = new DatabaseError('Custom error', 'CUSTOM_CODE', 503);
      expect(error.message).toBe('Custom error');
      expect(error.code).toBe('CUSTOM_CODE');
      expect(error.statusCode).toBe(503);
    });
  });

  describe('NotFoundError', () => {
    it('should create a not found error with entity and id', () => {
      const error = new NotFoundError('Product', 123);
      expect(error.message).toBe('Product with ID 123 not found');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('NotFoundError');
    });

    it('should handle string ids', () => {
      const error = new NotFoundError('User', 'abc-123');
      expect(error.message).toBe('User with ID abc-123 not found');
    });
  });

  describe('ValidationError', () => {
    it('should create a validation error', () => {
      const error = new ValidationError('Invalid email format');
      expect(error.message).toBe('Validation error: Invalid email format');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('ValidationError');
    });
  });

  describe('ConflictError', () => {
    it('should create a conflict error', () => {
      const error = new ConflictError('Resource already exists');
      expect(error.message).toBe('Conflict: Resource already exists');
      expect(error.code).toBe('CONFLICT');
      expect(error.statusCode).toBe(409);
      expect(error.name).toBe('ConflictError');
    });
  });
});

describe('handleDatabaseError', () => {
  it('should convert generic errors to DatabaseError', () => {
    const error = new Error('Generic error');
    expect(() => handleDatabaseError(error)).toThrow(DatabaseError);
    expect(() => handleDatabaseError(error)).toThrow('Database operation failed: Generic error');
  });

  it('should convert string errors to DatabaseError', () => {
    expect(() => handleDatabaseError('String error')).toThrow(DatabaseError);
    expect(() => handleDatabaseError('String error')).toThrow('Database operation failed: String error');
  });

  it('should rethrow DatabaseError instances unchanged if no special code', () => {
    const error = new DatabaseError('Test error');
    expect(() => handleDatabaseError(error)).toThrow(error);
  });

  it('should convert DatabaseError with SQLITE_CONSTRAINT and UNIQUE to ConflictError', () => {
    const error = new DatabaseError('UNIQUE constraint failed');
    (error as any).code = 'SQLITE_CONSTRAINT';
    expect(() => handleDatabaseError(error)).toThrow(ConflictError);
    expect(() => handleDatabaseError(error)).toThrow('Resource already exists');
  });

  it('should convert DatabaseError with SQLITE_CONSTRAINT and FOREIGN KEY to ValidationError', () => {
    const error = new DatabaseError('FOREIGN KEY constraint failed');
    (error as any).code = 'SQLITE_CONSTRAINT';
    expect(() => handleDatabaseError(error)).toThrow(ValidationError);
    expect(() => handleDatabaseError(error)).toThrow('Invalid reference to related entity');
  });

  it('should convert other DatabaseError with SQLITE_CONSTRAINT to ValidationError', () => {
    const error = new DatabaseError('CHECK constraint failed');
    (error as any).code = 'SQLITE_CONSTRAINT';
    expect(() => handleDatabaseError(error)).toThrow(ValidationError);
  });

  it('should convert DatabaseError with SQLITE_BUSY to DatabaseError with 503 status', () => {
    const error = new DatabaseError('Database is locked');
    (error as any).code = 'SQLITE_BUSY';
    try {
      handleDatabaseError(error);
    } catch (e) {
      if (e instanceof DatabaseError) {
        expect(e.statusCode).toBe(503);
        expect(e.code).toBe('DATABASE_BUSY');
      }
    }
  });

  it('should convert DatabaseError with "No rows affected" to NotFoundError when entity and id provided', () => {
    const error = new DatabaseError('No rows affected');
    expect(() => handleDatabaseError(error, 'Product', 123)).toThrow(NotFoundError);
  });
});

describe('errorHandler middleware', () => {
  it('should handle DatabaseError and return appropriate JSON response', () => {
    const error = new DatabaseError('Test error', 'TEST_CODE', 503);
    const req = {} as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const next = vi.fn() as NextFunction;

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'TEST_CODE',
        message: 'Test error',
      },
    });
  });

  it('should handle NotFoundError with 404 status', () => {
    const error = new NotFoundError('Product', 123);
    const req = {} as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const next = vi.fn() as NextFunction;

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'NOT_FOUND',
        message: 'Product with ID 123 not found',
      },
    });
  });

  it('should handle non-DatabaseError with 500 status', () => {
    const error = new Error('Unknown error');
    const req = {} as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const next = vi.fn() as NextFunction;

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  });

  it('should handle ValidationError with 400 status', () => {
    const error = new ValidationError('Invalid input');
    const req = {} as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const next = vi.fn() as NextFunction;

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should handle ConflictError with 409 status', () => {
    const error = new ConflictError('Duplicate resource');
    const req = {} as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const next = vi.fn() as NextFunction;

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
  });
});
