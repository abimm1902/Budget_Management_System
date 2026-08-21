import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PaymentRepository } from './payment.repository';
import { ExpenseRepository } from '../expense/expense.repository';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ExpenseStatus } from '../common/enums/expense-status.enum';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { EmployeeRepository } from '../employee/employee.repository';
import { COUCHBASE } from '../database/couchbase/couchbase.module';

const doc_pre = 'payment';
@Injectable()
export class PaymentService {

  constructor(
    private readonly repository: PaymentRepository,
    private readonly expenseRepository: ExpenseRepository,
    private readonly employeeRepo:EmployeeRepository,
      @Inject(COUCHBASE) private readonly db: any,
  ) {}

  async create(dto: CreatePaymentDto) {
    
     try {
      return await this.db.transaction(async (ctx: any) => {
         const manager =await this.employeeRepo.findById(dto.paidBy);
      if (!manager) {
    throw new NotFoundException('Employee not found');
  }
  if (manager.role !== 'MANAGER') {
    throw new ForbiddenException('Employee is not a manager');
  }
        const expenseDoc = await this.expenseRepository.findByIdInTx(ctx, dto.expenseId);
        if (!expenseDoc) throw new NotFoundException('Expense not found');

        const expense: any = expenseDoc.content;
        if (expense.status !== ExpenseStatus.APPROVED) {
          throw new BadRequestException('Expense is not approved');
        }
        if (expense.paymentStatus === PaymentStatus.PAID) {
          throw new BadRequestException('Expense is already paid');
        }

        const payment = {
          paymentId: `${doc_pre}:${randomUUID()}`,
          expenseId: expense.expenseId,
          amount: expense.amount,
          paidBy: dto.paidBy,
          paidAt: new Date().toISOString(),
        };

        expense.paymentStatus = PaymentStatus.PAID;
        expense.updatedAt = new Date().toISOString();

        await this.expenseRepository.updateInTx(ctx, expenseDoc, expense);
        await this.repository.createInTx(ctx, payment.paymentId, payment);

        return payment;
      });
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof BadRequestException) {
        throw err;
      }
      throw new BadRequestException('Could not record payment right now, please try again');
    }
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const payment = await this.repository.findById(id);
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async findUnpaid() {
    const expenses = await this.expenseRepository.findByStatus(ExpenseStatus.APPROVED);
    return expenses.filter((e: any) => e.paymentStatus === PaymentStatus.UNPAID);
  }

  async findPaid() {
    const expenses = await this.expenseRepository.findByStatus(ExpenseStatus.APPROVED);
    return expenses.filter((e: any) => e.paymentStatus === PaymentStatus.PAID);
  }
}
