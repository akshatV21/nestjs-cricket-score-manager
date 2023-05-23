import { ContextType, ForbiddenException, UnauthorizedException } from '@nestjs/common'
import { EXCEPTION_MSGS } from '../constants'
import { RpcException } from '@nestjs/microservices'
import { WsException } from '@nestjs/websockets'

export function catchAuthErrors(err: any, type: ContextType) {
  console.log(err)
  switch (err.message) {
    case EXCEPTION_MSGS.NULL_TOKEN:
      throw type === 'http'
        ? new UnauthorizedException('Please log in first.')
        : type === 'rpc'
        ? new RpcException('Please log in first.')
        : new WsException('Please log in first.')
    case EXCEPTION_MSGS.UNAUTHORIZED:
      throw type === 'http'
        ? new ForbiddenException('You are not authorized to access this endpoint.')
        : type === 'rpc'
        ? new RpcException('You are not authorized to access this endpoint.')
        : new WsException('You are not authorized to access this endpoint.')
    case EXCEPTION_MSGS.JWT_EXPIRED:
      throw type === 'http'
        ? new UnauthorizedException('You token has expired. Please log in again.')
        : type === 'rpc'
        ? new RpcException('You token has expired. Please log in again.')
        : new WsException('You token has expired. Please log in again.')
    case EXCEPTION_MSGS.UNVERIFIED_EMAIL:
      throw type === 'http'
        ? new UnauthorizedException('Please verify your email first.')
        : type === 'rpc'
        ? new RpcException('Please verify your email first.')
        : new WsException('Please verify your email first.')
    default:
      throw type === 'http' ? new UnauthorizedException('Invalid Jwt.') : new RpcException('Invalid Jwt.')
  }
}
