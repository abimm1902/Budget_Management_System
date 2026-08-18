import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymentRepository } from './payment.repository';
import { ExpenseModule } from '../expense/expense.module';
import { EmployeeModule } from '../employee/employee.module';

@Module({
  imports: [ExpenseModule,EmployeeModule],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentRepository],
})
export class PaymentModule {}
