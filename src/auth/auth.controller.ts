import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(AuthGuard('local'))
  @Post('confirm')
  async loginWithCode(@Request() req) {
    return this.authService.loginWithCode(req.user, req.body.code);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  getProfile(@Request() req) {
    return req.user;
  }
}
