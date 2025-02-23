import { IRole } from "../../infrastructure/database/models/users/RoleSchema";

export interface IRoleRepository {
  create(role: Partial<IRole>): Promise<IRole>;
  update(role: Partial<IRole>): Promise<IRole | null>;
  delete(roleId: string): Promise<IRole | null>;
  getById(roleId: string): Promise<IRole | null>;
  getByName(name: string): Promise<IRole | null>;
  getAll(): Promise<IRole[]>;
}
