import { Injectable, NotFoundException , ConflictException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DepartmentRepository } from './department.repository';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

const Doc_pre='dept';
@Injectable()
export class DepartmentService {
  constructor(private readonly repository: DepartmentRepository) {}

 async create(dto: CreateDepartmentDto) {
     const existingDepartment = await this.repository.findByName(
    dto.departmentName,
  );

  if (existingDepartment) {
    throw new ConflictException('Department already exists');
  }

    const now = new Date().toISOString();
    const data = {
      departmentId:`${Doc_pre}:${randomUUID()}`,
      ...dto,
      createdAt: now,
      updatedAt: now,
    };
    return this.repository.create(data.departmentId, data);
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const data = await this.repository.findById(id);
    if (!data) throw new NotFoundException('Department not found');
    return data;
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    const data: any = await this.findOne(id);
    Object.assign(data, dto);
    data.updatedAt = new Date().toISOString();
    return this.repository.update(id, data);
  }
}
