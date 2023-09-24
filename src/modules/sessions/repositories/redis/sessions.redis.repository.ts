import { Injectable } from '@nestjs/common'
import { SessionNotFoundError } from '../../../../common/errors/not-found/SessionNotFound.error'
import { RedisService } from '../../../../recipes/redis/redis.service'
import {
  SessionEntity,
  SessionResponseEntity
} from '../../entities/session.entity'
import { SessionsPrismaRepository } from '../prisma/sessions.prisma.repository'
import { SessionsRepository } from '../sessions.repository'

@Injectable()
export class SessionsRedisRepository implements SessionsRepository {
  constructor(
    private readonly prisma: SessionsPrismaRepository,
    private readonly redis: RedisService
  ) {}

  private prefixEntity = 'session:'
  private prefixEntities = 'sessions:'

  async create(entity: SessionEntity): Promise<SessionResponseEntity> {
    const sessionCreate = await this.prisma.create(entity)

    const key = this.prefixEntity + sessionCreate.id

    const value = JSON.stringify(sessionCreate)

    await this.redis.del(key)

    await this.redis.set(key, value, 'EX', 86400)

    await this.redis.clean(this.prefixEntities)

    return new SessionResponseEntity(sessionCreate)
  }

  async update(
    id: string,
    entity: SessionEntity
  ): Promise<SessionResponseEntity> {
    const sessionUpdate = await this.prisma.update(id, entity)

    const key = this.prefixEntity + sessionUpdate.id

    const value = JSON.stringify(sessionUpdate)

    await this.redis.del(key)

    await this.redis.set(key, value, 'EX', 86400)

    await this.redis.clean(this.prefixEntities)

    return new SessionResponseEntity(sessionUpdate)
  }

  async findOne(id: string): Promise<SessionResponseEntity> {
    const key = this.prefixEntity + id

    const sessionCached = await this.redis.get(key)

    if (sessionCached) {
      const entityCached = JSON.parse(sessionCached)

      return new SessionResponseEntity(entityCached)
    }

    const sessionFound = await this.prisma.findOne(id)

    if (!sessionFound) {
      throw new SessionNotFoundError()
    }

    const value = JSON.stringify(sessionFound)

    await this.redis.set(key, value)

    return new SessionResponseEntity(sessionFound)
  }

  async disconnectedMany(userId: string): Promise<{ count: number }> {
    await this.redis.clean(this.prefixEntities)

    return await this.prisma.disconnectedMany(userId)
  }
}