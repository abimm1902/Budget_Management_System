import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Reports')
@Controller('reports')

export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('expenses/pending') pending() {
     return this.service.pending(); 
    }
  @Get('expenses/approved') approved() {
     return this.service.approved(); 
    }
  @Get('expenses/rejected') rejected() {
     return this.service.rejected(); 
    }
  @Get('expenses/department-wise') departmentWise() {
     return this.service.departmentWise(); 
    }
  @Get('expenses/category-wise') categoryWise() {
     return this.service.categoryWise();
     }
  @Get('expenses/top') top(@Query('limit') limit?: string) {
     return this.service.top(Number(limit) || 10); 
    }
  @Get('fullreport') dashboard() { 
    return this.service.FullReport(); 
  }
  @Get('budget')
  budget() { 
    return this.service.budget();
   }
}
