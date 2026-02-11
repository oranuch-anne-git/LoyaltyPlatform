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

  /** Member_GetInfo: full member info by memberId (profile, address, pointLedgers, redemptions, transactions). */
  @Get('get-info/:memberId')
  @UseGuards(AuthGuard('jwt'))
  getInfo(@Param('memberId') memberId: string, @Headers('authorization') authorization?: string) {
    return this.member.getInfo(memberId, authorization);
  }

  /** Create member. Body: profile + optional address (name, surname, nationalType, sex, birthdate, mobile, email, addr_*, etc.) */
  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() body: Record<string, unknown>, @Headers('authorization') authorization?: string) {
    return this.member.create(body, authorization);
  }

  /** Update member address only by memberId. Body: addr_addressNo, addr_building, addr_road, addr_soi, addr_subdistrict, addr_district, addr_province, addr_postalCode */
  @Patch(':memberId/address')
  @UseGuards(AuthGuard('jwt'))
  updateAddress(
    @Param('memberId') memberId: string,
    @Body() body: Record<string, unknown>,
    @Headers('authorization') authorization?: string,
  ) {
    return this.member.updateAddress(memberId, body, authorization);
  }

  /** Cancel member by memberId: mark active = false (deactivate). Does not delete the member. */
  @Patch(':memberId/cancel')
  @UseGuards(AuthGuard('jwt'))
  cancel(@Param('memberId') memberId: string, @Headers('authorization') authorization?: string) {
    return this.member.cancel(memberId, authorization);
  }

  /** Update member profile (and/or address) by memberId. Body: name, surname, nationalType, citizenId, passport, sex, birthdate, mobile, email, addr_*, etc. */
  @Patch(':memberId')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('memberId') memberId: string,
    @Body() body: Record<string, unknown>,
    @Headers('authorization') authorization?: string,
  ) {
    return this.member.update(memberId, body, authorization);
  }
}
