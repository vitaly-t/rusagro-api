import { Catch, ExceptionFilter, HttpException } from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: Error | HttpException, host) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    // const request = ctx.getRequest();

    let error = {};

    if (exception instanceof HttpException) {
      error = exception.message;
    } else {
      error = {
        status: 500,
        error: exception.message,
      };
    }

    response.status(200).json({
      success: false,
      error,
    });
  }
}
