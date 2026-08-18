import { IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateBudgetDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  allocatedAmount?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
