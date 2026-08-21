import { BadRequestException,  ForbiddenException ,  ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { BudgetRepository } from './budget.repository';
import { DepartmentRepository } from '../department/department.repository';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { EmployeeRepository } from '../employee/employee.repository';

const Doc_pre='budget';
@Injectable()
export class BudgetService {
  constructor(
    private readonly repository: BudgetRepository,
    private readonly departmentRepository: DepartmentRepository,
    private readonly employeeRepo: EmployeeRepository,
  ) {}

  async create(dto: CreateBudgetDto) {
   
     const employee=await this.employeeRepo.findById(dto.createdBy);
     if (!employee) {
    throw new NotFoundException('Employee not found');}

    if (employee.role !== 'MANAGER') {
      throw new ForbiddenException('Employee is not a manager');}
    const department = await this.departmentRepository.findById(dto.departmentId);
    if (!department) {
      throw new BadRequestException('Department not found');
    }

    const financialYear = dto.financialYear || this.getCurrentFinancialYear();
    if (await this.repository.findActive(dto.departmentId, financialYear)) {
      throw new ConflictException('Active budget already exists for this department');
    }

    const now = new Date().toISOString();
    const budget = {
      budgetId:`${Doc_pre}:${randomUUID()}`,
      departmentId: dto.departmentId,
      allocatedAmount: dto.allocatedAmount,
      usedAmount: 0,
      remainingAmount: dto.allocatedAmount,
      financialYear,
      isActive: true,
      createdBy: dto.createdBy,
      createdAt: now,
      updatedAt: now,
    };

    return this.repository.create(budget.budgetId, budget);
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const budget = await this.repository.findById(id);
    if (!budget) throw new NotFoundException('Budget not found');
    return budget;
  }

  async update(id: string, dto: UpdateBudgetDto) {
    const employee=await this.employeeRepo.findById(dto.createdBy);
     if (!employee) {
    throw new NotFoundException('Employee not found');}

    if (employee.role !== 'MANAGER') {
      throw new ForbiddenException('Employee is not a manager');}
    const budget: any = await this.findOne(id);

    if (dto.allocatedAmount !== undefined) {
      if (dto.allocatedAmount < budget.usedAmount) {
        throw new BadRequestException('Allocated amount cannot be less than used amount');
      }
      budget.allocatedAmount = dto.allocatedAmount;
      budget.remainingAmount = dto.allocatedAmount - budget.usedAmount;
    }

    if (dto.isActive !== undefined) budget.isActive = dto.isActive;
    budget.updatedAt = new Date().toISOString();
    return this.repository.update(id, budget);
  }

  findActiveBudget(departmentId: string, financialYear: string) {
    return this.repository.findActive(departmentId, financialYear);
  }

  async useBudget(id: string, amount: number) {
    const budget: any = await this.findOne(id);
    if (budget.remainingAmount < amount) {
      throw new BadRequestException('Insufficient budget');
    }

    budget.usedAmount += amount;
    budget.remainingAmount -= amount;
    budget.updatedAt = new Date().toISOString();

    return this.repository.update(id, budget);
  }


  async useBudgetInTx(ctx: any, id: string, amount: number) {
    const budgetDoc = await this.repository.findByIdInTx(ctx, id);
    if (!budgetDoc) throw new NotFoundException('Budget not found');

    const budget: any = budgetDoc.content;
    if (budget.remainingAmount < amount) {
      throw new BadRequestException('Insufficient budget');
    }

    budget.usedAmount += amount;
    budget.remainingAmount -= amount;
    budget.updatedAt = new Date().toISOString();

    return this.repository.updateInTx(ctx, budgetDoc, budget);
  }

   async delete(id: string) {
  const budget = await this.repository.findById(id);

  if (!budget) {
    throw new NotFoundException('budget not found');
  }
  await this.repository.delete(id);
  return {
    message: 'budget deleted successfully',
  };
}

  // Indian financial year: 1 April -> 31 March.
  private getCurrentFinancialYear() {
    const now = new Date();
    const year = now.getFullYear();
    const start = now.getMonth() >= 3 ? year : year - 1;
    return `${start}-${String(start + 1).slice(-2)}`;
  }
}
