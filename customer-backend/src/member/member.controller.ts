import { Body, Controller, Get, Headers, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MemberService } from './member.service';

@Controller('api/members')
export class MemberController {
  constructor(private readonly member: MemberService) {}

  /** Company_GetMemberLevel: list member levels (Yellow, Silver, Black) with benefit fields */
  @Get('levels')
  @UseGuards(AuthGuard('jwt'))
  getLevels(@Headers('authorization') authorization?: string) {
    return this.member.getLevels(authorization);
  }

  /** Member_GetInfo: full member info (profile, address, pointLedgers, redemptions, transactions). :id = internal UUID */
  @Get('get-info/:id')
  @UseGuards(AuthGuard('jwt'))
  getInfo(@Param('id') id: string, @Headers('authorization') authorization?: string) {
    return this.member.getInfo(id, authorization);
  }

  /** Create member. Body: profile + optional address (name, surname, nationalType, sex, birthdate, mobile, email, addr_*, etc.) */
  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() body: Record<string, unknown>, @Headers('authorization') authorization?: string) {
    return this.member.create(body, authorization);
  }

  /** Update member address only. Body: addr_addressNo, addr_building, addr_road, addr_soi, addr_subdistrict, addr_district, addr_province, addr_postalCode */
  @Patch(':id/address')
  @UseGuards(AuthGuard('jwt'))
  updateAddress(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Headers('authorization') authorization?: string,
  ) {
    return this.member.updateAddress(id, body, authorization);
  }

  /** Cancel member: mark active = false (deactivate). Does not delete the member. */
  @Patch(':id/cancel')
  @UseGuards(AuthGuard('jwt'))
  cancel(@Param('id') id: string, @Headers('authorization') authorization?: string) {
    return this.member.cancel(id, authorization);
  }

  /** Update member profile (and/or address). Body: name, surname, nationalType, citizenId, passport, sex, birthdate, mobile, email, addr_*, etc. */
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Headers('authorization') authorization?: string,
  ) {
    return this.member.update(id, body, authorization);
  }
}
