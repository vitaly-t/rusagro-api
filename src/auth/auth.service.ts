import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import Timeout = NodeJS.Timeout;
import { MailService } from '../core/mail/mail.service';
import * as crypto from 'crypto';

interface AuthObj {
  [userId: string]: { code: number, timerId: Timeout };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {
  }

  private authObj: AuthObj = {};

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneFull(username);
    const userPwd = user && user.password || '';
    const salt = userPwd.substring(0, 88);
    const passHash = userPwd.substring(88);
    const hashedLoginPwd = crypto.pbkdf2Sync(pass, salt, 1, 64, 'sha1');
    const isPwdValid = hashedLoginPwd.toString('base64') === passHash;
    if (user && isPwdValid) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    if (!user.email) {
      const payload = { username: user.username, sub: user.userId };
      return {
        jwt: this.jwtService.sign(payload),
        user,
      };
    } else {
      if (this.authObj[user.id]) {
        clearTimeout(this.authObj[user.id].timerId);
        delete this.authObj[user.id];
      }
      this.authObj[user.id] = { code: null, timerId: null };
      this.authObj[user.id].code = Math.floor(Math.random() * 9000 + 1000); // random number [1000, 9999]
      this.authObj[user.id].timerId = setTimeout(() => delete this.authObj[user.id], 120 * 1000); // 120s
      await this.mailService.sendMail(user.email, '' + this.authObj[user.id].code);
      return { id: user.username, firstName: user.firstName, lastName: user.lastName };
    }
  }

  async loginWithCode(user: any, code: string) {
    if (this.authObj[user.id] && +code === +this.authObj[user.id].code) {
      clearTimeout(this.authObj[user.id].timerId);
      delete this.authObj[user.id];
      const payload = { username: user.username, sub: user.userId };
      return {
        jwt: this.jwtService.sign(payload),
        user,
      };
    } else {
      throw new UnauthorizedException();
    }
  }
}
