import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Beer } from '../beers/beer.entity'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),

        entities: [Beer],

        synchronize: config.get('NODE_ENV') !== 'production',

        //logging: config.get('NODE_ENV') !== 'production',
        logging: false
      }),
    }),
  ],
})
export class DatabaseModule {}