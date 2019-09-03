import { Body, Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MachinesService } from './machines.service';

@UseGuards(AuthGuard('jwt'))
@Controller('machines')
export class MachinesController {
  constructor(private readonly machinesService: MachinesService) {
  }

  @Get('department/:departmentId')
  async findAll(@Param('departmentId') departmentId: number) {
    return await this.machinesService.findAll(departmentId);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.machinesService.findOne(id);
  }
}
