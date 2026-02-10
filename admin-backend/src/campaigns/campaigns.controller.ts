import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto, UpdateCampaignDto } from './dto';

@Controller('api/campaigns')
export class CampaignsController {
  constructor(private campaigns: CampaignsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() dto: CreateCampaignDto) {
    return this.campaigns.create(dto);
  }

  @Get()
  findAll(@Query('active') active?: string) {
    return this.campaigns.findAll(active !== 'false');
  }

  @Get('banners')
  getBanners() {
    return this.campaigns.getBanners();
  }

  @Post('banners')
  @UseGuards(AuthGuard('jwt'))
  createBanner(
    @Body() body: { campaignId?: string; title: string; imageUrl?: string; linkUrl?: string; sortOrder?: number },
  ) {
    return this.campaigns.createBanner(
      body.campaignId || null,
      body.title,
      body.imageUrl,
      body.linkUrl,
      body.sortOrder,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.campaigns.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body() dto: UpdateCampaignDto) {
    return this.campaigns.update(id, dto);
  }
}
