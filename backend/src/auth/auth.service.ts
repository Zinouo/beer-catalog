import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  login(profile: any) {
    const maintainerIds = (this.config.get<string>('MAINTAINER_IDS') || '')
      .split(',')
      .map((id) => id.trim());

    const payload = {
      id: String(profile.id),
      username: profile.username,
      displayName: profile.displayName,
      avatar: profile.photos?.[0]?.value,

      isMaintainer: maintainerIds.includes(String(profile.id)),
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: payload,
    };
  }
}