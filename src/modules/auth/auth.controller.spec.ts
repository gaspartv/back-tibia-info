import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { Test, TestingModule } from '@nestjs/testing'
import { LocalStrategy } from '../../recipes/passport-auth/strategies/local.strategy'
import { PrismaModule } from '../../recipes/prisma/prisma.module'
import { SessionsModule } from '../sessions/sessions.module'
import { UsersModule } from '../users/users.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

describe('AuthController', () => {
  let controller: AuthController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule,
        JwtModule.register({
          global: true,
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: process.env.JWT_EXPIRES_IN }
        }),
        PrismaModule,
        UsersModule,
        SessionsModule
      ],
      controllers: [AuthController],
      providers: [AuthService, LocalStrategy]
    }).compile()

    controller = module.get<AuthController>(AuthController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
