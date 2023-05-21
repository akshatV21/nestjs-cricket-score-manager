import { Body, Controller, Get, Post } from '@nestjs/common'
import { TeamsService } from './teams.service'
import { Auth, ReqUser, UserDocument } from '@lib/common'
import { CreateTeamDto } from './dtos/create-team.dto'

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @Auth({ types: ['manager'] })
  async httpCreateTeam(@Body() createTeamDto: CreateTeamDto, @ReqUser() user: UserDocument) {
    const team = await this.teamsService.create(createTeamDto, user)
    return { success: true, message: 'Team created successfully', data: { team } }
  }
}
