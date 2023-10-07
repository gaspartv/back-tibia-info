import {
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { IS_PUBLIC_KEY } from '../decorators/custom/is-public.decorator'

@Injectable()
export class JwtGuard extends AuthGuard('jwt-all') {
  constructor(private reflector: Reflector) {
    super()
  }

  canActivate(context: ExecutionContext): Promise<boolean> | boolean {
    const isPublic: boolean = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()]
    )

    if (isPublic) {
      return true
    }

    const canActivate = super.canActivate(context)

    if (typeof canActivate === 'boolean') {
      return canActivate
    }

    const canActivatePromise = canActivate as Promise<boolean>

    return canActivatePromise.catch((error) => {
      if (error instanceof Error) {
        throw new UnauthorizedException(error.message)
      }

      throw new UnauthorizedException('You dont have permission to access.')
    })
  }
}
