import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { RemarksDto } from './dto/remarks.dto';
import { RoleGuard } from '../common/guards/role.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { ApiHeader } from '@nestjs/swagger';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('Expense')
@Controller('expenses')
export class ExpenseController {
  constructor(private readonly service: ExpenseService) {}

  @Post()
  create(@Body() dto: CreateExpenseDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('employee/:employeeId')
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.service.findByEmployee(employeeId);
  }

  @Get('top')
  findTop(@Query('limit') limit?: string) {
    return this.service.findTop(Number(limit) || 10);
  }

  @Get('department/:departmentId')
  byDepartment(@Param('departmentId') id: string) {
    return this.service.findByDepartment(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  
  @Patch(':id/approve')
  approve(@Param('id') id: string, @Body() dto: RemarksDto) {
    return this.service.approve(id, dto);
  }


  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body() dto: RemarksDto) {
    return this.service.reject(id, dto);
  }
}
