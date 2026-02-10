import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RewardsService } from './rewards.service';
import { CreateRewardDto, UpdateRewardDto, RedeemRewardDto } from './dto';

@Controller('api/rewards')
export class RewardsController {
  constructor(private rewards: RewardsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() dto: CreateRewardDto) {
    return this.rewards.create(dto);
  }

  @Get()
  findAll(@Query('category') category?: string, @Query('active') active?: string) {
    return this.rewards.findAll(category, active !== 'false');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rewards.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body() dto: UpdateRewardDto) {
    return this.rewards.update(id, dto);
  }

  @Post('redeem')
  @UseGuards(AuthGuard('jwt'))
  redeem(@Body() dto: RedeemRewardDto) {
    return this.rewards.redeem(dto);
  }
}
