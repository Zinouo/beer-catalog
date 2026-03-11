import {
    Injectable,
    NotFoundException,
    ConflictException,
    ForbiddenException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { Beer } from './beer.entity';
  import { CreateBeerDto } from 'src/beers/dto/create-beer.dto';
  import { UpdateBeerDto } from 'src/beers/dto/update-beer.dto';
  import { FilterBeersDto } from 'src/beers/dto/filter-beer.dto';
  
  @Injectable()
  export class BeersService {
    constructor(
      @InjectRepository(Beer)
      private readonly beerRepo: Repository<Beer>,
    ) {}
  
    async findAll(
      filters: FilterBeersDto,
      user?: { id: string; isMaintainer: boolean },
    ): Promise<Beer[]> {
      const qb = this.beerRepo.createQueryBuilder('beer');

      if (!user?.isMaintainer) {
        const now = new Date();
        qb.where(
          `(beer.validityStart IS NULL AND beer.validityEnd IS NULL)
           OR (beer.validityStart <= :now AND beer.validityEnd >= :now)`,
          { now },
        );
      }
  
      if (filters.category) {
        qb.andWhere('beer.category = :category', { category: filters.category });
      }
  
      if (filters.search) {
        qb.andWhere('beer.name ILIKE :search', { search: `%${filters.search}%` });
      }
  
      if (filters.sort) {
        qb.orderBy('beer.alcoholPercentage', filters.sort);
      }
  
      return qb.getMany();
    }
  
    async findOne(id: string): Promise<Beer> {
      const beer = await this.beerRepo.findOne({ where: { id } });
      if (!beer) throw new NotFoundException(`Beer #${id} not found`);
      return beer;
    }
  
    async findCategories(): Promise<string[]> {
      const rows = await this.beerRepo
        .createQueryBuilder('beer')
        .select('DISTINCT beer.category', 'category')
        .orderBy('beer.category', 'ASC')
        .getRawMany();
      return rows.map((r) => r.category);
    }
  
    async create(
      dto: CreateBeerDto,
      userId: string,
      pictures: Buffer[],
    ): Promise<Beer> {
      const existing = await this.beerRepo.findOne({ where: { name: dto.name } });
      if (existing) throw new ConflictException('A beer with this name already exists');
  
      const beer = this.beerRepo.create({
        ...dto,
        pictures,
        createdBy: userId,
        validityStart: dto.validityStart ? new Date(dto.validityStart) : null,
        validityEnd: dto.validityEnd ? new Date(dto.validityEnd) : null,
      });
  
      return this.beerRepo.save(beer);
    }
  
    async update(
      id: string,
      dto: UpdateBeerDto,
      userId: string,
      newPictures?: Buffer[],
    ): Promise<Beer> {
      const beer = await this.findOne(id);
  

      if (beer.createdBy !== userId) {
        throw new ForbiddenException('Only the creator can update this beer');
      }
  
      if (dto.name && dto.name !== beer.name) {
        const existing = await this.beerRepo.findOne({ where: { name: dto.name } });
        if (existing) throw new ConflictException('A beer with this name already exists');
      }
  
      Object.assign(beer, {
        ...dto,
        validityStart: dto.validityStart !== undefined
          ? (dto.validityStart ? new Date(dto.validityStart) : null)
          : beer.validityStart,
        validityEnd: dto.validityEnd !== undefined
          ? (dto.validityEnd ? new Date(dto.validityEnd) : null)
          : beer.validityEnd,
        ...(newPictures?.length ? { pictures: newPictures } : {}),
      });
  
      return this.beerRepo.save(beer);
    }
  
    async remove(id: string, userId: string): Promise<void> {
      const beer = await this.findOne(id);
      if (beer.createdBy !== userId) {
        throw new ForbiddenException('Only the creator can delete this beer');
      }
      await this.beerRepo.remove(beer);
    }
  }