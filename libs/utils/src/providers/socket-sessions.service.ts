import { Injectable } from '@nestjs/common'
import { AuthenticatedSocket } from '../interfaces'
import { Types } from 'mongoose'

@Injectable()
export class SocketSessions {
  private sessions: Map<string | Types.ObjectId, AuthenticatedSocket> = new Map()

  getSocket(id: string | Types.ObjectId) {
    return this.sessions.get(id)
  }

  setSocket(userId: string | Types.ObjectId, socket: AuthenticatedSocket) {
    this.sessions.set(userId, socket)
  }

  removeSocket(userId: string | Types.ObjectId) {
    this.sessions.delete(userId)
  }
  getSockets(): Map<string | Types.ObjectId, AuthenticatedSocket> {
    return this.sessions
  }
}
