import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { TeamsService } from './teams.service'
import { Auth, ReqUser, UserDocument } from '@lib/common'
import { CreateTeamDto } from './dtos/create-team.dto'
import { Types } from 'mongoose'

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @Auth({ types: ['manager'] })
  async httpCreateTeam(@Body() createTeamDto: CreateTeamDto, @ReqUser() user: UserDocument) {
    const team = await this.teamsService.create(createTeamDto, user)
    return { success: true, message: 'Team created successfully.', data: { team } }
  }

  @Get(':teamId')
  @Auth({ types: ['player', 'scorer', 'manager'] })
  async httpGetTeamById(@Param('teamId') teamId: Types.ObjectId, @ReqUser() user: UserDocument) {
    const team = await this.teamsService.get(teamId, user)
    return { success: true, message: 'Team fetched successfully.', data: { team } }
  }
}
