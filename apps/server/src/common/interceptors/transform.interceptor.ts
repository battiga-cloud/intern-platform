// apps/server/src/common/interceptors/transform.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_MESSAGE, RESPONSE_CODE } from '../decorators/response.decorator';

export interface Response<T> {
  code: number;
  msg: string;
  data: T;
  time: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  // 注入 Reflector
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    // 获取当前处理请求的路由方法 (Handler)
    const handler = context.getHandler();

    // 通过反射获取 Controller 上配置的自定义 message 和 code
    const message = this.reflector.get<string>(RESPONSE_MESSAGE, handler) || '请求成功';
    const code = this.reflector.get<number>(RESPONSE_CODE, handler) || 200;

    return next.handle().pipe(
      map((data) => {
        return {
          code,     // 使用自定义的业务代码，默认 200
          msg: message, // 使用自定义的提示信息，默认 '请求成功'
          data: data ?? null, 
          time: new Date().toISOString(),
        };
      }),
    );
  }
}