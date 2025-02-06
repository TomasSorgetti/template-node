import mongoose from "mongoose";
import { User } from "../../domain/entities/User";
import { UserRepositoryImpl } from "../../infrastructure/database/repositories/UserRepositoryImpl";
import {
  APIError,
  ConflictError,
  GoneError,
} from "../../shared/utils/app-errors";
import { IUser } from "../../infrastructure/database/models/UserSchema";
import { SecurityService } from "../../infrastructure/services/SecurityService";
import { IUserData } from "../interfaces/IUserService";

export class UserService {
  private securityService: SecurityService;
  private userRepository: UserRepositoryImpl;
  constructor() {
    this.securityService = new SecurityService();
    this.userRepository = new UserRepositoryImpl();
  }

  public async createUser(
    userData: IUserData,
    session: mongoose.ClientSession
  ): Promise<IUser> {
    const existingUser = await this.userRepository.findByEmail(userData.email);

    if (existingUser) {
      if (existingUser.deleted) {
        throw new GoneError("User deleted");
      }
      throw new ConflictError("User already exists");
    }

    const hashedPassword = await this.securityService.hashPassword(
      userData.password
    );

    const validRoles = userData.roles.filter((role) =>
      mongoose.Types.ObjectId.isValid(role)
    );

    if (validRoles.length !== userData.roles.length) {
      throw new APIError("Invalid role(s) provided");
    }

    const user = new User(
      userData.name,
      userData.email,
      hashedPassword,
      userData.roles
    );

    const userPrimitives = user.toPrimitives();

    return await this.userRepository.create(userPrimitives, session);
  }

  public async getUserByEmail(email: string): Promise<any> {
    return await this.userRepository.findByEmail(email);
  }

  public async startTransaction(): Promise<mongoose.ClientSession> {
    const session = await mongoose.startSession();
    session.startTransaction();
    return session;
  }
}
