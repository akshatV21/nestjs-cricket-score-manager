import { MatchRepository, UserDocument } from '@lib/common'
import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UsePipes, ValidationPipe } from '@nestjs/common'
import { Types } from 'mongoose'

@Injectable()
@UsePipes(new ValidationPipe({ transform: true }))
export class IsMatchScorer implements CanActivate {
  constructor(private readonly MatchRepository: MatchRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const scorer: UserDocument = request.user

    const matchId = request.body.matchId
    const match = await this.MatchRepository.findById(matchId)

    if (!match.teams.includes(new Types.ObjectId(scorer.team)))
      throw new ForbiddenException('You are forbidden to make this request.')
    request.match = matchId

    return true
  }
}
