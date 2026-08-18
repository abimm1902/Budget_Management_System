import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RemarksDto {
  @IsString()
  @IsOptional()
  managerRemarks?: string;

  @IsString()
  @IsNotEmpty()
  managerID!:string;
}
