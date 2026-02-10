import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PointsService } from './points.service';
import { EarnPointsDto, RedeemPointsDto, AdjustPointsDto } from './dto';
import { Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('api/points')
export class PointsController {
  constructor(private points: PointsService) {}

  @Get('balance/:memberId')
  @UseGuards(AuthGuard('jwt'))
  getBalance(@Param('memberId') memberId: string) {
    return this.points.getBalance(memberId);
  }

  @Post('earn')
  @UseGuards(AuthGuard('jwt'))
  earn(@Body() dto: EarnPointsDto, @Req() req: Request & { user?: { id: string } }) {
    return this.points.earn(dto, req.user?.id);
  }

  @Post('redeem')
  @UseGuards(AuthGuard('jwt'))
  redeem(@Body() dto: RedeemPointsDto) {
    return this.points.redeem(dto);
  }

  @Post('adjust')
  @UseGuards(AuthGuard('jwt'))
  adjust(@Body() dto: AdjustPointsDto, @Req() req: Request & { user?: { id: string } }) {
    return this.points.adjust(dto, req.user!.id);
  }

  @Get('ledger/:memberId')
  @UseGuards(AuthGuard('jwt'))
  getLedger(@Param('memberId') memberId: string, @Query('limit') limit?: string) {
    return this.points.getLedger(memberId, limit ? parseInt(limit, 10) : 50);
  }

  @Get('transactions/:memberId')
  @UseGuards(AuthGuard('jwt'))
  getTransactions(@Param('memberId') memberId: string, @Query('limit') limit?: string) {
    return this.points.getTransactions(memberId, limit ? parseInt(limit, 10) : 50);
  }
}
