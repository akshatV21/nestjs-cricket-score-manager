import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common'
import { TeamsService } from './teams.service'
import { Auth, ReqUser, UserDocument } from '@lib/common'
import { CreateTeamDto } from './dtos/create-team.dto'
import { Types } from 'mongoose'
import { CreateRequestDto } from './dtos/create-request.dto'
import { ParseObjectId } from '@lib/utils'
import { RequestsService } from './requests/requests.service'
import { UpdateRequestDto } from './dtos/update-request.dto'
import { Token } from '@lib/common/auth/decorators/token.decorator'

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService, private readonly requestsService: RequestsService) {}

  @Post()
  @Auth({ types: ['manager'] })
  async httpCreateTeam(@Body() createTeamDto: CreateTeamDto, @ReqUser() user: UserDocument) {
    const team = await this.teamsService.create(createTeamDto, user)
    return { success: true, message: 'Team created successfully.', data: { team } }
  }

  @Get()
  @Auth({ types: ['player', 'scorer', 'manager'] })
  async httpListTeams(@Query('page', ParseIntPipe) page: number) {
    const teams = await this.teamsService.list(page)
    return { success: true, message: 'Teams fetched successfully.', data: { teams, nextPage: page + 1 } }
  }

  @Get(':teamId')
  @Auth({ types: ['player', 'scorer', 'manager'] })
  async httpGetTeamById(@Param('teamId', ParseObjectId) teamId: Types.ObjectId, @ReqUser() user: UserDocument) {
    const team = await this.teamsService.get(teamId, user)
    return { success: true, message: 'Team fetched successfully.', data: { team } }
  }

  @Post('requests')
  @Auth({ types: ['manager'] })
  async httpCreateRequest(
    @Body() createRequestDto: CreateRequestDto,
    @ReqUser() user: UserDocument,
    @Token() token: string,
  ) {
    const request = await this.requestsService.create(createRequestDto, user, token)
    return { success: true, message: 'Request created successfully', data: { request } }
  }

  @Patch('requests/accept')
  @Auth({ types: ['player', 'scorer'] })
  async httpAcceptRequest(
    @Body() updateRequestDto: UpdateRequestDto,
    @ReqUser() user: UserDocument,
    @Token() token: string,
  ) {
    const request = await this.requestsService.accept(updateRequestDto, user, token)
    return { success: true, message: 'Request accepted successfully', data: { request } }
  }

  @Patch('requests/deny')
  @Auth({ types: ['player', 'scorer'] })
  async httpDenyRequest(
    @Body() updateRequestDto: UpdateRequestDto,
    @ReqUser() user: UserDocument,
    @Token() token: string,
  ) {
    const request = await this.requestsService.deny(updateRequestDto, user, token)
    return { success: true, message: 'Request denied successfully', data: { request } }
  }

  @Get('requests')
  @Auth({ types: ['player', 'scorer', 'manager'] })
  async httpListRequests(@Query('page', ParseIntPipe) page: number, @ReqUser() user: UserDocument) {
    const requests = await this.requestsService.list(page, user)
    return { success: true, message: 'requests fetched successfully.', data: { requests, nextPage: page + 1 } }
  }

  @Get('requests/:requestId')
  @Auth({ types: ['player', 'scorer', 'manager'] })
  async httpGetRequestById(
    @Param('requestId', ParseObjectId) requestId: Types.ObjectId,
    @ReqUser() user: UserDocument,
  ) {
    const request = await this.requestsService.get(requestId, user)
    return { success: true, message: 'Requests fetched successfully.', data: { request } }
  }
}
