import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateSchoolDto, UpdateSchoolDto, SchoolQueryDto } from './dto/school.dto';

@Injectable()
export class SchoolsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSchoolDto) {
    const existing = await this.prisma.school.findUnique({ where: { name: dto.name } });
    if (existing) throw new ConflictException('学校名称已存在');

    return this.prisma.school.create({ data: dto });
  }

  async findAll(query: SchoolQueryDto) {
    const { page = 1, pageSize = 10, keyword } = query;
    const skip = (page - 1) * pageSize;

    const where = keyword ? { name: { contains: keyword, mode: 'insensitive' as any } } : {};

    const [total, records] = await this.prisma.$transaction([
      this.prisma.school.count({ where }),
      this.prisma.school.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { records, total, page, pageSize };
  }

  async findOne(id: string) {
    const school = await this.prisma.school.findUnique({ where: { id } });
    if (!school) throw new BadRequestException('学校不存在');
    return school;
  }

  async update(id: string, dto: UpdateSchoolDto) {
    if (dto.name) {
      const existing = await this.prisma.school.findFirst({
        where: { name: dto.name, NOT: { id } },
      });
      if (existing) throw new ConflictException('学校名称已存在');
    }

    return this.prisma.school.update({ where: { id }, data: dto });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.school.update({ where: { id }, data: { status } });
  }

  async remove(id: string) {
    // 🔴 防误删保护：如果该学校下还有班级或用户，禁止删除
    const classesCount = await this.prisma.class.count({ where: { schoolId: id } });
    if (classesCount > 0) throw new BadRequestException('该学校下存在关联的班级，无法直接删除');

    const usersCount = await this.prisma.user.count({ where: { schoolId: id } });
    if (usersCount > 0) throw new BadRequestException('该学校下存在关联的账号，无法直接删除');

    return this.prisma.school.delete({ where: { id } });
  }
}