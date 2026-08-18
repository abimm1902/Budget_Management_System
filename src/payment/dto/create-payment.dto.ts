import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  expenseId!: string;

  @IsString()
  @IsNotEmpty()
  paidBy!: string;
}
