import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    // 获取 Nest 默认抛出的响应对象
    const exceptionResponse: any = exception.getResponse();

    // 提取并解析 message 字段
    let msg = exception.message;
    let errorType = 'Error';

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      // 如果 class-validator 返回的是数组，默认取第一条提示
      msg = Array.isArray(exceptionResponse.message)
        ? exceptionResponse.message[0]
        : exceptionResponse.message || exception.message;
      
      // 提取原始的 error 类型（例如 "Bad Request"）
      errorType = exceptionResponse.error || exception.name;
    } else if (typeof exceptionResponse === 'string') {
      msg = exceptionResponse;
    }

    // 将新老结构合并在一个对象中返回
    response.status(status).json({
      // ====== 🔴 新版统一结构 (给新接入的 alova 等拦截器使用) ======
      code: status,
      msg: msg,
      data: null,
      time: new Date().toISOString(),

      // ====== 🔵 兼容旧版结构 (保持旧前端代码、旧请求库的正常运转) ======
      statusCode: status,
      message: msg,
      error: errorType,
    });
  }
}