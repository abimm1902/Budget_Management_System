import { IsBoolean, IsNumber, IsString, IsOptional, Min, IsNotEmpty } from 'class-validator';

export class UpdateBudgetDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  allocatedAmount?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

   @IsString()
    @IsNotEmpty()
    createdBy!: string;
}
