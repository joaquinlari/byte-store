import { Request, Response } from "express";
import { UserService } from "./users.service";

export class UserController {
  private readonly userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userService.findAll();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: " Error interno del servidor" });
    }
  }

  public async getById(
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> {
    const id = req.params.id;
    if (!id || id.trim().length === 0) {
      res.status(400).json({ message: "No es valido el ID de usuario" });
      return;
    }

    try {
      const user = await this.userService.findUserById(id);

      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ message: "Usuario no encontrado" });
      }
    } catch (error: any) {
      console.error("Error fetching user:", error);
      res.status(400).json({ message: error.message });
    }
  }

  public async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        res.status(400).json({ message: "Faltan campos obligatorios" });
        return;
      }

      // Obligamos a que sea 'user'
      const userData = {
        name,
        email,
        password,
        role: "user" as const,
      };

      const newUser = await this.userService.createUser(userData);
      res.status(201).json(newUser);
    } catch (error) {
      console.error(" Error en createUser:", error);
      res.status(500).json({ message: "Error al crear usuario" });
    }
  }

  async createAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, secretKey } = req.body;

      // La validación de tu clave secreta
      if (secretKey !== "super_secreto_utn_2026") {
        res
          .status(403)
          .json({ message: "No tienes permiso para crear administradores" });
        return;
      }

      if (!name || !email || !password) {
        res.status(400).json({ message: "Faltan campos obligatorios" });
        return;
      }

      // Asignamos el rol de 'admin'
      const userData = {
        name,
        email,
        password,
        role: "admin" as const,
      };

      const newUser = await this.userService.createUser(userData);
      res.status(201).json(newUser);
    } catch (error) {
      console.error("❌ Error en createAdmin:", error);
      res.status(500).json({ message: "Error al crear administrador" });
    }
  }

  public async updateUser(
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> {
    const id = req.params.id as string;
    if (!id || id.trim().length === 0) {
      res.status(400).json({ message: "ID inválido" });
      return;
    }
    try {
      const user = await this.userService.updateUser(id, req.body);

      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ message: "Usuario no encontrado" });
      }
    } catch (error: any) {
      console.error("Error updating user ", error);
      res.status(400).json({ message: error.message });
    }
  }

  public async deleteUser(
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> {
    const id = req.params.id;

    if (!id || id.trim().length === 0) {
      res.status(400).json({ error: "No es valido el ID del usuario" });
      return;
    }

    try {
      const deleted = await this.userService.deleteUser(id);

      if (deleted) {
        res.status(200).json({ message: "Usuario eliminado correctamente" });
      } else {
        res.status(404).json({ error: "Usuario no encontrado" });
      }
    } catch (error: any) {
      console.error("Error deleting User:", error);
      res.status(400).json({ message: error.message });
    }
  }
}
