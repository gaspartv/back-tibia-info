import { Test } from '@nestjs/testing/test'
import { TestingModule } from '@nestjs/testing/testing-module'
import { randomUUID } from 'crypto'
import { UsersRepository } from '../users/repositories/users.repository'
import { SessionCreateDto } from './dto/create-session.dto'
import { SessionsFakeRepository } from './repositories/fake/sessions.fake.repository'
import { SessionsRepository } from './repositories/sessions.repository'
import { SessionsService } from './sessions.service'

describe('SessionsService', () => {
  let service: SessionsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        { provide: SessionsRepository, useClass: SessionsFakeRepository },
        { provide: UsersRepository, useValue: { findOne: jest.fn() } }
      ]
    }).compile()

    service = module.get<SessionsService>(SessionsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should create a new session', async () => {
    const userId = randomUUID()

    const dto: SessionCreateDto = { userId }

    const session = await service.create(dto)

    expect(session).toBeDefined()

    const expectedProperties = [
      'id',
      'connectedAt',
      'disconnectedAt',
      'expiresAt',
      'tokens',
      'userId'
    ]

    expectedProperties.forEach((property) => {
      expect(session).toHaveProperty(property)
    })

    for (const prop in session) {
      expect(expectedProperties).toContain(prop)
    }
  })

  it('should call disconnectedMany on the repository', async () => {
    const userId = randomUUID()

    const dto: SessionCreateDto = { userId }

    await service.create(dto)
    await service.create(dto)

    const { count } = await service.disconnectedMany(userId)

    expect(count).toBeDefined()
    expect(count).toEqual(2)
  })
})
