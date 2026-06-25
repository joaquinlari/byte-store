import { UserRepository } from "./users.repository.interface";
import { User } from "./users.entity";

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async findUserById(id: string): Promise<User | null> {
    if (!id || id.trim().length === 0) {
      throw new Error("El ID de usuario es obligatorio.");
    }

    return this.userRepository.findUserById(id);
  }

  async createUser(userData: Omit<User, "id">): Promise<User> {
    this.validateUserData(userData);

    return this.userRepository.createUser(userData);
  }

  async updateUser(
    id: string,
    userData: Partial<Omit<User, "id">>,
  ): Promise<User | null> {
    if (!id || id.trim().length === 0) {
      throw new Error("El ID de usuario es obligatorio.");
    }
    this.validateUserData(userData, true);
    return this.userRepository.updateUser(id, userData);
  }

  async deleteUser(id: string): Promise<boolean> {
    if (!id || id.trim().length === 0) {
      throw new Error("User ID is required");
    }

    return this.userRepository.deleteUser(id);
  }

  private validateUserData(userData: Partial<User>, isUpdate = false): void {
    if (!isUpdate || userData.name !== undefined) {
      if (!userData.name || userData.name.trim().length < 3) {
        throw new Error(
          "El nombre de usuario debe tener al menos 3 caracteres.",
        );
      }
    }
    // 2. Validar Email
    if (!isUpdate || userData.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!userData.email || !emailRegex.test(userData.email)) {
        throw new Error("El formato del correo electrónico no es válido.");
      }
    }

    // 3. Validar Rol
    if (!isUpdate || userData.role !== undefined) {
      const validRoles = ["user", "admin"];
      if (!userData.role || !validRoles.includes(userData.role)) {
        throw new Error("El rol debe ser 'user' o 'admin'.");
      }
    }
  }
}
