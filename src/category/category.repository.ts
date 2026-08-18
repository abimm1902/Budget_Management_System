import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { COUCHBASE } from '../database/couchbase/couchbase.module';
import { Category } from './interfaces/category.interface';

@Injectable()
export class CategoryRepository {
  constructor(@Inject(COUCHBASE) private readonly db: any) {}

  async create(id: string, data: Category) {
    await this.db.collection('categories').insert(id, data);
    return data;
  }

  async findAll(): Promise<Category[]> {
    const result = await this.db.query(
      `SELECT x.* FROM ${this.db.keyspace('categories')} x ORDER BY x.createdAt DESC`
    );
    return result.rows;
  }

  async findById(id: string): Promise<Category | null> {
    try {
      const result = await this.db.collection('categories').get(id);
      return result.content;
    } catch {
      return null;
    }
  }

  async update(id: string, data: Category) {
    await this.db.collection('categories').replace(id, data);
    return data;
  }
  async delete(id: string) {
  await this.db.collection('employees').remove(id);
}
}
