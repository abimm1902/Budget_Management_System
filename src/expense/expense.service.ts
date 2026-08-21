import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ExpenseRepository } from './expense.repository';
import { EmployeeRepository } from '../employee/employee.repository';
import { CategoryRepository } from '../category/category.repository';
import { BudgetService } from '../budget/budget.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseStatus } from '../common/enums/expense-status.enum';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { RemarksDto } from './dto/remarks.dto';
import { COUCHBASE } from '../database/couchbase/couchbase.module';

const Doc_pre='expense'
@Injectable()
export class ExpenseService {
  constructor(
    private readonly repository: ExpenseRepository,
    private readonly employeeRepository: EmployeeRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly budgetService: BudgetService,
        @Inject(COUCHBASE) private readonly db: any,

  ) {}

  async create(dto: CreateExpenseDto) {
   
    const employee = await this.employeeRepository.findById(dto.employeeId);
    if (!employee || !employee.isActive ) {
      throw new BadRequestException('Employee not found or inactive');
    }
     if (employee.role !== 'EMPLOYEE') {
     throw new ForbiddenException('Employee is not a EMPLOYEE');
    }

   
    const category = await this.categoryRepository.findById(dto.categoryId);
    if (!category) {
      throw new BadRequestException('Category not found ');
    }

    const date = new Date(dto.expenseDate);
    if (Number.isNaN(date.getTime()) || date > new Date()) {
      throw new BadRequestException('Expense date is invalid or in the future');
    }

    const now = new Date().toISOString();
    const expense = {
      expenseId:`${Doc_pre}:${randomUUID()}`,
      employeeId: dto.employeeId,
      departmentId: employee.departmentId,
      categoryId: dto.categoryId,
      amount: dto.amount,
      expenseDate: dto.expenseDate,
      description: dto.description || '',
      status: ExpenseStatus.PENDING,
      paymentStatus: PaymentStatus.UNPAID,
      managerRemarks: '',
      financialYear: this.getFinancialYear(date),
      createdAt: now,
      updatedAt: now,
    };

    return this.repository.create(expense.expenseId, expense);
  }

  findAll() {
    return this.repository.findAll();
  }

  findByEmployee(employeeId: string) {
    return this.repository.findByEmployee(employeeId);
  }

  async findOne(id: string) {
    const expense = await this.repository.findById(id);
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  findTop(limit = 10) {
    return this.repository.findTop(limit);
  }

  findByDepartment(id: string) {
    return this.repository.findByDepartment(id);
  }
 
  async approve(id: string,dto :RemarksDto,) {
    try {
      return await this.db.transaction(async (ctx: any) => {
        const manager=await this.employeeRepository.findById(dto.managerID);
     if (!manager) {
    throw new NotFoundException('Employee not found');
    }
    if (manager.role !== 'MANAGER') {
    throw new ForbiddenException('Employee is not a manager');
    }
        const expenseDoc = await this.repository.findByIdInTx(ctx, id);
        if (!expenseDoc) throw new NotFoundException('Expense not found');

        const expense: any = expenseDoc.content;
        if (expense.status !== ExpenseStatus.PENDING) {
          throw new ConflictException('Expense is already processed');
        }

        const employee = await this.employeeRepository.findById(expense.employeeId);
        if (!employee?.isActive) throw new BadRequestException('Employee is inactive');

        const budget: any = await this.budgetService.findActiveBudget(
          expense.departmentId,
          expense.financialYear,
        );
        if (!budget) throw new BadRequestException('No active budget found');

        // Deduct from the budget inside the same transaction.
        await this.budgetService.useBudgetInTx(ctx, budget.budgetId, expense.amount);

        // Flip the expense status inside the same transaction.
        expense.status = ExpenseStatus.APPROVED;
        expense.managerRemarks = dto.managerRemarks || 'Approved';
        expense.updatedAt = new Date().toISOString();
        await this.repository.updateInTx(ctx, expenseDoc, expense);

        return expense;
      });
    } catch (err) {
      // Business-rule errors thrown above are the real reason for failure -
      // pass them straight through so the controller returns the right
      // status code. Anything else means Couchbase couldn't commit the
      // transaction (e.g. after retrying on conflicts) - surface that too.
      if (
        err instanceof NotFoundException ||
        err instanceof ConflictException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }
      throw new ConflictException('Could not approve expense right now, please try again');
    }
  }




  async reject(id: string, dto :RemarksDto,) {
      const manager=await this.employeeRepository.findById(dto.managerID);
     if (!manager) {
    throw new NotFoundException('Employee not found');
    }
    if (manager.role !== 'MANAGER') {
    throw new ForbiddenException('Employee is not a manager');
    }
    const expense: any = await this.repository.findById(id);
    if (!expense) throw new NotFoundException('Expense not found');
    if (expense.status !== ExpenseStatus.PENDING) {
      throw new ConflictException('Expense is already processed');
    }

    expense.status = ExpenseStatus.REJECTED;
    expense.managerRemarks = dto.managerRemarks || 'Rejected';
    expense.updatedAt = new Date().toISOString();
    return this.repository.update(id, expense);
  }

  // Indian financial year: 1 April -> 31 March.
  private getFinancialYear(date: Date) {
    const year = date.getFullYear();
    const start = date.getMonth() >= 3 ? year : year - 1;
    return `${start}-${String(start + 1).slice(-2)}`;
  }
}
