import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PaymentRepository } from './payment.repository';
import { ExpenseRepository } from '../expense/expense.repository';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ExpenseStatus } from '../common/enums/expense-status.enum';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { EmployeeRepository } from '../employee/employee.repository';

const doc_pre = 'payment';
@Injectable()
export class PaymentService {

  constructor(
    private readonly repository: PaymentRepository,
    private readonly expenseRepository: ExpenseRepository,
    private readonly employeeRepo:EmployeeRepository,
  ) {}

  async create(dto: CreatePaymentDto) {
     const manager =await this.employeeRepo.findById(dto.paidBy);
      if (!manager) {
    throw new NotFoundException('Employee not found');
  }
  if (manager.role !== 'MANAGER') {
    throw new ForbiddenException('Employee is not a manager');
  }
    const expense: any = await this.expenseRepository.findById(dto.expenseId);
    if (!expense) throw new NotFoundException('Expense not found');
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

    await this.expenseRepository.update(expense.expenseId, expense);
    return this.repository.create(payment.paymentId, payment);
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
