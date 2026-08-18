import { Role } from '../../common/enums/role.enum';

// No password here - there is no login in this project anymore.
export interface Employee {
  employeeId: string;
  name: string;
  email: string;
  departmentId: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
