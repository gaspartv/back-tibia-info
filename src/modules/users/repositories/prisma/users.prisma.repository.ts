import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../recipes/prisma/prisma.service'
import { VerifyUniqueFieldUserDto } from '../../dto/verify-unique-field.dto'
import { UserEntity } from '../../entities/user.entity'
import { UsersRepository } from '../users.repository'

@Injectable()
export class UsersPrismaRepository implements UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(entity: UserEntity): Promise<UserEntity> {
    return await this.prisma.user.create({ data: entity })
  }

  async update(id: string, entity: UserEntity): Promise<UserEntity> {
    return await this.prisma.user.update({ where: { id }, data: entity })
  }

  async findOne(id: string): Promise<UserEntity> {
    return await this.prisma.user.findUnique({ where: { id } })
  }

  async verifyUniqueFieldToCreated(
    dto: VerifyUniqueFieldUserDto
  ): Promise<VerifyUniqueFieldUserDto> {
    return await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { phone: dto.phone }] },
      select: { email: true, phone: true }
    })
  }

  async verifyUniqueFieldToUpdate(
    id: string,
    dto: VerifyUniqueFieldUserDto
  ): Promise<VerifyUniqueFieldUserDto> {
    return await this.prisma.user.findFirst({
      where: {
        OR: [
          { id: { not: id }, email: dto.email },
          { id: { not: id }, phone: dto.phone }
        ]
      },
      select: { email: true, phone: true }
    })
  }
}