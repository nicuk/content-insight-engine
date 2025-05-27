import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './user.repository';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    this.logger.log(`Registering user with email: ${registerDto.email}`);

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(registerDto.email);
    if (existingUser) {
      throw new UnauthorizedException('Email already in use');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(registerDto.password);

    // Create user
    const user = await this.userRepository.create({
      email: registerDto.email,
      password: hashedPassword,
    });

    // Generate JWT token
    const token = this.generateToken(user.id, user.email);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async login(loginDto: LoginDto) {
    this.logger.log(`Login attempt for email: ${loginDto.email}`);

    // Find user by email
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await this.comparePasswords(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const token = this.generateToken(user.id, user.email);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async validateUser(userId: string): Promise<any> {
    return this.userRepository.findById(userId);
  }

  private generateToken(userId: string, email: string): string {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  private async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
