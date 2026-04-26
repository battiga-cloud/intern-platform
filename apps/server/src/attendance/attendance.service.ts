import { Injectable } from '@nestjs/common';
import { AttendanceStatus } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  // 随机俏皮语录库 (也可以存在数据库里，但硬编码在内存里读取最快)
  private readonly funQuotes = [
    "只要我敲键盘够快，烦恼就追不上我。",
    "今天也是为老板换新车努力的一天！",
    "打工不仅能致富，还能交到好朋友（假的）。",
    "咖啡哪有上班苦。",
    "我爱工作，工作使我快乐（试图催眠）。",
    "实习的意义在于，提前感受社会的毒打。",
  ];

  /**
   * 接口 1：获取随机语录
   */
  getRandomQuote() {
    const randomIndex = Math.floor(Math.random() * this.funQuotes.length);
    return { quote: this.funQuotes[randomIndex] };
  }

  /**
   * 接口 2：Upsert 提交打卡状态和语录
   * 这个接口非常强大，前端切换"状态"或提交"语录"都可以调这个接口
   */
  async submitAttendance(userId: string, dto: { date: string; status: string; quote?: string }) {
    return this.prisma.attendance.upsert({
      where: {
        // 利用联合唯一索引查找当天的记录
        userId_date: { userId, date: dto.date },
      },
      update: {
        status: dto.status as AttendanceStatus,
        quote: dto.quote,
      },
      create: {
        userId,
        date: dto.date,
        status: dto.status as AttendanceStatus,
        quote: dto.quote,
      },
    });
  }

  /**
   * 接口 3：拉取某月的所有打卡数据（回填日历用）
   */
  async getMonthlyAttendance(userId: string, yearMonth: string) { // yearMonth 格式: '2026-04'
    const records = await this.prisma.attendance.findMany({
      where: {
        userId,
        date: {
          startsWith: yearMonth, // 利用字符串前缀匹配拉取整月数据
        },
      },
    });
    
    // 转换成前端好用的 Record 字典格式: { '2026-04-15': { status: 'WORK', quote: '...', isSaved: true } }
    const result = {};
    records.forEach(r => {
      result[r.date] = {
        status: r.status,
        quote: r.quote,
        isSaved: !!r.quote
      };
    });
    return result;
  }
}