/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { ApiError } from './api-error'

type Handler = (req: NextRequest, context?: any) => Promise<NextResponse>

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