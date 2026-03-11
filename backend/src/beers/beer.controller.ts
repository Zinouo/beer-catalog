import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Res,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { BeersService } from './beer.service';        
import { FilterBeersDto } from './dto/filter-beer.dto'; 
import type { Response } from 'express'; 
import { CreateBeerDto } from './dto/create-beer.dto';
import { UpdateBeerDto } from './dto/update-beer.dto';
import { JwtAuthGuard, OptionalJwtGuard, MaintainerGuard } from '../auth/guards';

@Controller('beers')
export class BeersController {
  constructor(private readonly beersService: BeersService) {}

  @Get()
  @UseGuards(OptionalJwtGuard)
  findAll(@Query() filters: FilterBeersDto, @Request() req) {
    return this.beersService.findAll(filters, req.user);
  }

  @Get('categories')
  getCategories() {
    return this.beersService.findCategories();
  }

  @Get(':id/pictures/:index')
  async getPicture(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('index') index: string,
    @Res() res: Response,
  ) {
    const beer = await this.beersService.findOneRaw(id); 
    const pic = beer.pictures[parseInt(index)];
    if (!pic) return res.status(404).send();
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(pic);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.beersService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, MaintainerGuard)
  @UseInterceptors(FilesInterceptor('pictures', 10, { limits: { fileSize: 5 * 1024 * 1024 } }))
  create(
    @Body() dto: CreateBeerDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req,
  ) {
    const pictures = (files || []).map((f) => f.buffer);
    return this.beersService.create(dto, req.user.id, pictures);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('pictures', 10, { limits: { fileSize: 5 * 1024 * 1024 } }))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBeerDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req,
  ) {
    const newPictures = (files || []).map((f) => f.buffer);
    const removedIndexes = dto['removedIndexes']
      ? [dto['removedIndexes']].flat().map(Number)
      : [];
    return this.beersService.update(id, dto, req.user.id, newPictures, removedIndexes);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.beersService.remove(id, req.user.id);
  }
}