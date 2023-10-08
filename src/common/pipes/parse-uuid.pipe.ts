import { Injectable } from '@nestjs/common/decorators/core/injectable.decorator'
import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception'
import { PipeTransform } from '@nestjs/common/interfaces/features/pipe-transform.interface'
import { validate as uuidValidate, version as uuidVersion } from 'uuid'

@Injectable()
export class ParseUuidPipe implements PipeTransform<string> {
  private _version: number

  version(version: number) {
    this._version = version
    return this
  }

  transform(value: string): string {
    if (!uuidValidate(value)) {
      throw new BadRequestException('UUID in url is not valid.')
    }

    if (this._version && uuidVersion(value) !== this._version) {
      throw new BadRequestException('UUID in url is not valid.')
    }

    return value
  }
}
