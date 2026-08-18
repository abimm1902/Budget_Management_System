import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CategoryRepository } from './category.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateStatusDto } from '../common/dto/update-status.dto';


const Doc_pre='category';
@Injectable()
export class CategoryService {
  constructor(private readonly repository: CategoryRepository) {}

  async create(dto: CreateCategoryDto) {
    const now = new Date().toISOString();
    const data: any = {
      categoryId:`${Doc_pre}:${randomUUID()}`,
      ...dto,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    return this.repository.create(data.categoryId, data);
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const data = await this.repository.findById(id);
    if (!data) throw new NotFoundException('Category not found');
    return data;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const data: any = await this.findOne(id);
    Object.assign(data, dto);
    data.updatedAt = new Date().toISOString();
    return this.repository.update(id, data);
  }
  async delete(id: string) {
  const category = await this.repository.findById(id);

  if (!category) {
    throw new NotFoundException('category not found');
  }

  await this.repository.delete(id);

  return {
    message: 'category deleted successfully',
  };
}

}
