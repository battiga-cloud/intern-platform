import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { GqlAuthGuard } from '../auth/gql-auth.guard';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @UseGuards(GqlAuthGuard) // 只有登录用户才能访问
  @Post('sign-in')
  async signIn(@Request() req, @Body() body: any) {
    // req.user 是经过 GqlAuthGuard 解析出来的用户信息 (里面包含 sub 即 studentId)
    const studentId = req.user.sub; 
    const { location, mood } = body;

    // return this.attendanceService.signIn(studentId, location, mood);
  }
}
