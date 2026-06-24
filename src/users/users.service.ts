import { UserRepository } from "./users.repository.interface";
import { User } from "./users.entity";

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findAll(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  async findUserById(id: string): Promise<User | null> {
    if (!id || id.trim().length === 0) {
      throw new Error("User ID is required");
    }

    const user = await this.userRepository.findUserById(id);

    if (!user) {
      return null;
    }

    return user;
  }

  async createUser(userData: Omit<User, "id" | "create_time">): Promise<User> {
    this.validateUserData(userData);

    const user = await this.userRepository.createUser(userData);
    return user;
  }

  async updateUser(
    id: string,
    userData: Partial<Omit<User, "id" | "create_time">>,
  ): Promise<User | null> {
    return this.userRepository.updateUser(id, userData);
  }

  async deleteUser(id: string): Promise<boolean> {
    if (!id || id.trim().length === 0) {
      throw new Error("User ID is required");
    }

    const deleted = await this.userRepository.deleteUser(id);

    return deleted;
  }

  private validateUserData(userData: Omit<User, "id" | "create_time">): void {
    if (!userData.name || userData.name.trim().length < 3) {
      throw new Error("El nombre de usuario debe tener al menos 3 caracteres.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userData.email || !emailRegex.test(userData.email)) {
      throw new Error("El formato del correo electrónico no es válido.");
    }

    const validRoles = ["user", "admin"];
    if (!validRoles.includes(userData.role)) {
      throw new Error("El rol debe ser 'user' o 'admin'.");
    }
  }
}
