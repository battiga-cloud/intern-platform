// apps/server/src/common/decorators/response.decorator.ts
import { SetMetadata } from '@nestjs/common';

// 定义 Metadata 的 key
export const RESPONSE_MESSAGE = 'response_message';
export const RESPONSE_CODE = 'response_code';

/**
 * 自定义返回消息装饰器
 * @param message 提示信息
 */
export const ResponseMessage = (message: string) => SetMetadata(RESPONSE_MESSAGE, message);

/**
 * 自定义返回业务代码装饰器
 * @param code 业务状态码
 */
export const ResponseCode = (code: number) => SetMetadata(RESPONSE_CODE, code);
