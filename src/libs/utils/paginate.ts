import { Result } from 'src/common/dtos/result.dto';

export const paginate = async <T, R>(
  repositoryQuery: (() => Promise<[T[], number]>) | [T[], number],
  pageSize = 10,
  pageNumber = 1,
  mapper?: (entity: T) => R | Promise<R>,
) => {
  const [data, totalCount] = Array.isArray(repositoryQuery)
    ? repositoryQuery
    : await repositoryQuery();

  const totalPages = Math.ceil(totalCount / pageSize);
  const hasPreviousPage = pageNumber > 1;
  const hasNextPage = pageNumber < totalPages;

  const mappedData = mapper
    ? await Promise.all(data.map(mapper))
    : (data as unknown as R[]);

  return new Result<R[]>({
    data: mappedData,
    pageSize: Math.min(pageSize, totalCount),
    pageNumber,
    totalPages,
    totalCount,
    hasPreviousPage,
    hasNextPage,
  });
};
