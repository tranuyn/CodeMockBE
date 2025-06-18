import { Transform } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';
import { SortField } from '../enums/sortField';
import { SortOrder } from '../enums/sortOder';

export class PaginationQuery {
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  pageSize: number = 10;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  pageNumber: number = 1;

  @IsOptional()
  @IsIn(Object.values(SortField))
  sortField: SortField = SortField.CREATED_AT;

  @IsOptional()
  @IsIn([SortOrder.ASC, SortOrder.DESC])
  sortOrder: SortOrder = SortOrder.ASC;
}
