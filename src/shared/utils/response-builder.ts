import { HttpException, HttpStatus } from '@nestjs/common';
import { CustomError } from '../../common/custom-error';

export const handleReponse = (error: any, data: any) => {
  if (error) {
    if (error.code && error.message) {
      throw new HttpException(error.message, error.code);
    }
    throw new HttpException(
      'Internal Server error',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
  return data;
};

export const handleError = (error: any) => {
  if (error instanceof CustomError) {
    throw new HttpException(error.message, error.code);
  }
  throw new HttpException(
    'Internal Server Error',
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
};
