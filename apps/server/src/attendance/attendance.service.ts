import { Injectable, BadRequestException } from '@nestjs/common';
import dayjs from 'dayjs';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  // 模拟盲盒签语库
  private blindBoxMessages = [
    "遇到难题先思考再问师傅，职场经验值 +1！",
    "今天也要保持好心情，食堂阿姨可能多给你打一勺肉哦。",
    "每一个熟练的技工，都曾像你现在一样认真记录。",
    "早起的鸟儿有虫吃，今日份的元气已送达！"
  ];

  async signIn(userId: string, location: string, mood?: string) {
    const todayStr = dayjs().format('YYYY-MM-DD');

    // 1. 检查今日是否已签到
    const existingRecord = await this.prisma.attendance.findUnique({
      where: {
        userId_signDate: { // 注意这里变成了 userId_signDate
          userId,
          signDate: todayStr,
        },
      },
    });

    if (existingRecord) {
      throw new BadRequestException('今天已经签到过了哦，明天再来吧！');
    }

    const randomIndex = Math.floor(Math.random() * this.blindBoxMessages.length);
    const blindBoxText = this.blindBoxMessages[randomIndex];

    // 2. 写入数据库
    const newRecord = await this.prisma.attendance.create({
      data: {
        userId, // 注意这里
        signDate: todayStr,
        location,
        mood,
        blindBox: blindBoxText,
      },
    });

    return {
      message: '签到成功',
      data: newRecord
    };
  }
}
