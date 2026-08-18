import { Inject, Injectable } from '@nestjs/common';
import { COUCHBASE } from '../database/couchbase/couchbase.module';
import { Employee } from './interfaces/employee.interface';

@Injectable()
export class EmployeeRepository {
  constructor(@Inject(COUCHBASE) private readonly db: any) {}

  async create(id: string, data: Employee) {
    await this.db.collection('employees').insert(id, data);
    return data;
  }

  async findAll(): Promise<Employee[]> {
    const result = await this.db.query(
      `SELECT x.* FROM ${this.db.keyspace('employees')} x ORDER BY x.createdAt DESC`,
    );
    return result.rows;
  }

  
  async findById(id: string): Promise<Employee | null> {
    try {
      return (await this.db.collection('employees').get(id)).content;
    } catch {
      return null;
    }
  }



  async update(id: string, data: Employee) {
    await this.db.collection('employees').replace(id, data);
    return data;
  }
}
