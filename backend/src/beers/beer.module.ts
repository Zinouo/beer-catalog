import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Beer } from './beer.entity';
import { BeersController } from 'src/beers/beer.controller';
import { BeersService } from 'src/beers/beer.service';

@Module({
  imports: [TypeOrmModule.forFeature([Beer])],
  controllers: [BeersController],
  providers: [BeersService],
})
export class BeersModule {}