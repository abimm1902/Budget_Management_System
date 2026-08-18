import { IsNumber, IsOptional, IsString, IsNotEmpty, Min } from 'class-validator';

export class CreateBudgetDto {
  @IsString()
  @IsNotEmpty()
  departmentId!: string;

  @IsNumber()
  @Min(0)
  allocatedAmount!: number;

  @IsString()
  @IsOptional()
  financialYear?: string;

 
  @IsString()
  @IsNotEmpty()
  createdBy!: string;
}
