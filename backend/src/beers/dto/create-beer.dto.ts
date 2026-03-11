import {
    IsString,
    IsNumber,
    IsOptional,
    IsDateString,
    Min,
    Max,
    Validate,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  
  @ValidatorConstraint({ name: 'dateRange', async: false })
  export class DateRangeConstraint implements ValidatorConstraintInterface {
    validate(_: any, args: ValidationArguments) {
      const obj = args.object as CreateBeerDto;
      if (!obj.validityStart || !obj.validityEnd) return true;
      return new Date(obj.validityStart) < new Date(obj.validityEnd);
    }
  
    defaultMessage() {
      return 'validityStart must be before validityEnd';
    }
  }
  
  export class CreateBeerDto {
    @IsString()
    name: string;
  
    @IsString()
    category: string;
  
    @IsString()
    description: string;
  
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @Max(100)
    alcoholPercentage: number;
  
    @IsOptional()
    @IsDateString()
    validityStart?: string;
  
    @IsOptional()
    @IsDateString()
    @Validate(DateRangeConstraint)
    validityEnd?: string;
  }