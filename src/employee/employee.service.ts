import { Injectable, NotFoundException ,ConflictException} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { EmployeeRepository } from './employee.repository';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';


const Doc_pre='employee'
@Injectable()
export class EmployeeService {
  constructor(private readonly repository: EmployeeRepository,
   
  ) {}

async  create(dto: CreateEmployeeDto) {
    
    const now = new Date().toISOString();
    const employee = {
      employeeId: `${Doc_pre}:${randomUUID()}`,
      ...dto,
      email: dto.email.toLowerCase(),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    return this.repository.create(employee.employeeId, employee);
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const employee = await this.repository.findById(id);
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }
  

  async update(id: string, dto: UpdateEmployeeDto) {
    const employee: any = await this.findOne(id);

    if (dto.name !== undefined) employee.name = dto.name;
    if (dto.email !== undefined) employee.email = dto.email.toLowerCase();
    if (dto.departmentId !== undefined) employee.departmentId = dto.departmentId;
    if (dto.role !== undefined) employee.role = dto.role;

    employee.updatedAt = new Date().toISOString();
    return this.repository.update(id, employee);
  }

 async delete(id: string) {
  const employee = await this.repository.findById(id);

  if (!employee) {
    throw new NotFoundException('Employee not found');
  }

  await this.repository.delete(id);

  return {
    message: 'Employee deleted successfully',
  };
}
  

}
