import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { COUCHBASE } from '../database/couchbase/couchbase.module';
import { Department } from './interfaces/department.interface';

@Injectable()
export class DepartmentRepository {
  constructor(@Inject(COUCHBASE) private readonly db: any) {}

  async create(id: string, data: Department) {
    await this.db.collection('departments').insert(id, data);
    return data;
  }

  async findAll(): Promise<Department[]> {
    const result = await this.db.query(
      `SELECT x.* FROM ${this.db.keyspace('departments')} x ORDER BY x.createdAt DESC`
    );
    return result.rows;
  }

  async findById(id: string): Promise<Department | null> {
    try {
      const result = await this.db.collection('departments').get(id);
      return result.content;
    } catch {
      return null;
    }
  }

  async findByName(departmentName: string) {
  const query = `
    SELECT d.*
    FROM${this.db.keyspace('departments')}d
    WHERE LOWER(d.departmentName) = LOWER($departmentName)
    LIMIT 1
  `;

  const result = await this.db.query(query, {
    parameters: { departmentName },
  });

  return result.rows[0] || null;
}
  async update(id: string, data: Department) {
    await this.db.collection('departments').replace(id, data);
    return data;
  }

  async delete(id: string) {
  await this.db
    .collection('employees')
    .remove(id);
 
}
}
