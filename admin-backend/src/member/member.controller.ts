import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MemberService } from './member.service';
import { CreateMemberDto, UpdateMemberDto, UpdateMemberLevelDto } from './dto';

@Controller('api/members')
export class MemberController {
  constructor(private member: MemberService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() dto: CreateMemberDto) {
    return this.member.create(dto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 20;
    return this.member.findAll(isNaN(p) ? 1 : p, isNaN(l) ? 20 : l, search);
  }

  /** Company_GetMemberLevel: list all member levels (Yellow, Silver, Black) with benefit fields */
  @Get('levels')
  @UseGuards(AuthGuard('jwt'))
  getLevels() {
    return this.member.getLevels();
  }

  /** Update a member level (name, sortOrder, privilegeDetail). */
  @Patch('levels/:id')
  @UseGuards(AuthGuard('jwt'))
  updateLevel(@Param('id') id: string, @Body() dto: UpdateMemberLevelDto) {
    return this.member.updateLevel(id, dto);
  }

  /** Member_GetInfo: get full member info by internal id (profile, address, point ledger, redemptions, transactions) */
  @Get('get-info/:id')
  @UseGuards(AuthGuard('jwt'))
  getInfo(@Param('id') id: string) {
    return this.member.getInfo(id);
  }

  @Get('by-id/:memberId')
  @UseGuards(AuthGuard('jwt'))
  findByMemberId(@Param('memberId') memberId: string) {
    return this.member.findByMemberId(memberId);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('id') id: string) {
    return this.member.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body() dto: UpdateMemberDto) {
    return this.member.update(id, dto);
  }
}
