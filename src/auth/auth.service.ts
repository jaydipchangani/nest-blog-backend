import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new UnauthorizedException('Email already registered');
    }
    const user = await this.usersService.create(dto);
    const { password, ...result } = user;
    return result;
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.generateJwt(user);
  }

  async oauthLogin(profile: any) {
    const email = profile.email;
    let user = await this.usersService.findByEmail(email);

    if (!user) {
      user = await this.usersService.create({
  email,
  password: '',
  name: profile.displayName || 'No Name',
  role: 'user',
  subscription: false,
});

    }

    return this.generateJwt(user);
  }

  public generateJwt(user: any) {
    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
      subscription: user.subscription,
    };
    return { access_token: this.jwtService.sign(payload) };
  }
}
