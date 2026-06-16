/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { ApiError } from './api-error'

// Handlers may return a NextResponse (the common case) or a plain streaming
// Response (e.g. the SSE chat route). NextResponse extends Response, so this
// widening is backward-compatible with every existing handler.
type Handler = (req: NextRequest, context?: any) => Promise<Response>

export function withErrorHandler(handler: Handler): Handler {
  return async (req, context) => {
    try {
      return await handler(req, context)
    } catch (error) {
      if (error instanceof ApiError) {
        return NextResponse.json(
          {
            error: {
              code: error.code,
              message: error.message,
            },
          },
          { status: error.statusCode }
        )
      }

      console.error('[API Error]', error)
      return NextResponse.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Something went wrong. Please try again.',
          },
        },
        { status: 500 }
      )
    }
  }
}