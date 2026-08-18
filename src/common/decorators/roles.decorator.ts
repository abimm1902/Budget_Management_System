import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

// Attaches allowed roles to a route, e.g. @Roles(Role.ADMIN)
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
