import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common'
import { Types } from 'mongoose'

@Injectable()
export class ParseObjectId implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    return value ? new Types.ObjectId(value) : null
  }
}
