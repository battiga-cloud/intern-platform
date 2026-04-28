import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateClassDto, UpdateClassDto, ClassQueryDto } from './dto/class.dto';
import { RoleCode } from '@muxi/shared';

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * 生成数据隔离的 Where 条件
   */
  private buildIsolationWhere(currentUser: any, providedSchoolId?: string) {
    const where: any = {};
    if (currentUser.roles?.some(r => r.code === RoleCode.SCHOOL_ADMIN)) {
      if (!currentUser.manageSchoolId) {
        throw new BadRequestException('当前学校管理员未绑定管理学校');
      }
      where.schoolId = currentUser.manageSchoolId; // 强制锁死查询本校
    } else if (providedSchoolId) {
      where.schoolId = providedSchoolId; // 超管或平台管理员可以自由筛选
    }
    return where;
  }

  async create(dto: CreateClassDto, currentUser: any) {
    // 越权防御：强制锁死创建为当前用户的所属学校
    let finalSchoolId = dto.schoolId;

    // 🔴 修复点 2：如果是校管，强制锁死创建为他管理的学校
    if (currentUser.roles?.some(r => r.code === RoleCode.SCHOOL_ADMIN)) {
      finalSchoolId = currentUser.manageSchoolId;
    }

    if (!finalSchoolId) throw new BadRequestException('必须指定所属学校');

    // 校验学校是否存在
    const school = await this.prisma.school.findUnique({ where: { id: finalSchoolId } });
    if (!school) throw new BadRequestException('所属学校不存在');

    // 校验同校班级名不重复
    const existing = await this.prisma.class.findUnique({
      where: { name_schoolId: { name: dto.name, schoolId: finalSchoolId } },
    });
    if (existing) throw new ConflictException('该学校下已存在同名班级');

    return this.prisma.class.create({
      data: { ...dto, schoolId: finalSchoolId },
    });
  }

  async findAll(query: ClassQueryDto, currentUser: any) {
    const { page = 1, pageSize = 10, keyword, schoolId } = query;
    const skip = (page - 1) * pageSize;

    const whereCondition: any = {
      ...this.buildIsolationWhere(currentUser, schoolId),
      ...(keyword && { name: { contains: keyword, mode: 'insensitive' } }),
    };

    const [total, records] = await this.prisma.$transaction([
      this.prisma.class.count({ where: whereCondition }),
      this.prisma.class.findMany({
        where: whereCondition,
        skip,
        take: pageSize,
        orderBy: [{ grade: 'desc' }, { createdAt: 'desc' }], // 优先按年级倒序排，年级为空则按创建时间
        include: {
          school: { select: { name: true } },
          _count: { select: { memberships: true } },
        },
      }),
    ]);

    return { records, total, page, pageSize };
  }

  async update(id: string, dto: UpdateClassDto, currentUser: any) {
    // 权限校验：确保该班级属于当前管理员的学校
    const cls = await this.prisma.class.findFirst({
      where: { id, ...this.buildIsolationWhere(currentUser) },
    });
    if (!cls) throw new BadRequestException('班级不存在或无权操作');

    if (dto.name) {
      const existing = await this.prisma.class.findFirst({
        where: { name: dto.name, schoolId: cls.schoolId, NOT: { id } },
      });
      if (existing) throw new ConflictException('本校已存在同名班级');
    }

    // 忽略非法修改 schoolId 的企图
    delete dto.schoolId;

    return this.prisma.class.update({ where: { id }, data: dto });
  }

  async remove(id: string, currentUser: any) {
    const cls = await this.prisma.class.findFirst({
      where: { id, ...this.buildIsolationWhere(currentUser) },
    });
    if (!cls) throw new BadRequestException('班级不存在或无权操作');

    // 防误删：班里还有人不能删
    const studentCount = await this.prisma.classMember.count({ where: { classId: id } });
    if (studentCount > 0) throw new BadRequestException('该班级下已有学员，请先移除或转移学员');

    return this.prisma.class.delete({ where: { id } });
  }
}