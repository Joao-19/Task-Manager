import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  private authServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.authServiceUrl =
      this.configService.get<string>('AUTH_SERVICE_URL') ||
      'http://localhost:3002';
  }

  async findAll() {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.authServiceUrl}/users`),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Erro no Auth Service',
        error.response?.status || 500,
      );
    }
  }
}
