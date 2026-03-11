import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Beer } from './beer.entity';
import { CreateBeerDto } from './dto/create-beer.dto';
import { UpdateBeerDto } from './dto/update-beer.dto';
import { FilterBeersDto } from './dto/filter-beer.dto';

@Injectable()
export class BeersService {
  constructor(
    
    @InjectRepository(Beer)
    private readonly beerRepo: Repository<Beer>,
  ) {}

  private serialize(beer: Beer) {
    const { pictures, ...rest } = beer;
    return { ...rest, pictureCount: pictures?.length ?? 0 };
  }

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

    return (await qb.getMany()).map(this.serialize.bind(this));
  }


  async findOneRaw(id: string): Promise<Beer> {
    const beer = await this.beerRepo.findOne({ where: { id } });
    if (!beer) throw new NotFoundException(`Beer #${id} not found`);
    return beer;
  }
  
  async findOne(id: string) {
    return this.serialize(await this.findOneRaw(id));
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
    removedIndexes?: number[],
  ): Promise<Beer> {
    const beer = await this.beerRepo.findOne({ where: { id } });
    if (!beer) throw new NotFoundException(`Beer #${id} not found`);

    if (beer.createdBy !== userId) {
      throw new ForbiddenException('Only the creator can update this beer');
    }

    if (dto.name && dto.name !== beer.name) {
      const existing = await this.beerRepo.findOne({ where: { name: dto.name } });
      if (existing) throw new ConflictException('A beer with this name already exists');
    }

    let updatedPictures = [...(beer.pictures ?? [])];
    if (removedIndexes?.length) {
      updatedPictures = updatedPictures.filter((_, i) => !removedIndexes.includes(i));
    }
    if (newPictures?.length) {
      updatedPictures = [...updatedPictures, ...newPictures];
    }

    Object.assign(beer, {
      ...dto,
      pictures: updatedPictures,
      validityStart: dto.validityStart !== undefined
        ? (dto.validityStart ? new Date(dto.validityStart) : null)
        : beer.validityStart,
      validityEnd: dto.validityEnd !== undefined
        ? (dto.validityEnd ? new Date(dto.validityEnd) : null)
        : beer.validityEnd,
    });

    return this.beerRepo.save(beer);
  }

  async remove(id: string, userId: string) {
    const beer = await this.beerRepo.findOne({ where: { id } });
    if (!beer) throw new NotFoundException(`Beer #${id} not found`);
    if (beer.createdBy !== userId) throw new ForbiddenException('Only the creator can remove');
    await this.beerRepo.remove(beer);
  }
}