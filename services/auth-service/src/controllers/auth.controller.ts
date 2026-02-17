import { Body, Controller, Post } from '@nestjs/common';
import { AuthDomainService } from '../domain/auth.domain.service';
import { LoginDto } from '../dto/login.dto';
import { RefreshDto } from '../dto/refresh.dto';
import { RegisterDto } from '../dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authDomainService: AuthDomainService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authDomainService.register(dto.email, dto.password, dto.tenantId);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authDomainService.login(dto.email, dto.password);
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshDto) {
    return this.authDomainService.refresh(dto.refreshToken);
  }
}
