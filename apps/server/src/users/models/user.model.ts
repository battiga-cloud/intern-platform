import 'reflect-metadata';
import {
  ObjectType,
  HideField,
  Field,
  ID,
} from '@nestjs/graphql';
import { IsEmail } from 'class-validator';
import { BaseModel } from '../../common/models/base.model';
import { Role } from '@prisma/client';

// 👇 1. 新增：将 Role 定义为一个 GraphQL 对象，代表数据库的 Role 表
@ObjectType()
export class RoleModel {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  code: string;
}

@ObjectType()
export class User extends BaseModel {
  @Field()
  @IsEmail()
  email: string;

  @Field(() => String, { nullable: true })
  firstname?: string;

  @Field(() => String, { nullable: true })
  lastname?: string;

  // 👇 2. 修改这里：把原本的 @Field(() => Role) 改成一对多数组关联
  @Field(() => [RoleModel], { nullable: 'itemsAndList', description: '用户绑定的角色列表' })
  roles?: RoleModel[];

  @HideField()
  password: string;
}
