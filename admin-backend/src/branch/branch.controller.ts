import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BranchService } from './branch.service';

@Controller('api/branches')
export class BranchController {
  constructor(private branch: BranchService) {}

  @Get()
  findAll(@Query('active') active?: string) {
    return this.branch.findAll(active !== 'false');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.branch.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() body: { code: string; name: string; address?: string; region?: string }) {
    return this.branch.create(body.code, body.name, body.address, body.region);
  }
}
