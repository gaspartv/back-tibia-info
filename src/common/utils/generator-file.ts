import { join } from 'path'
import { MessageFileDto } from '../../modules/users/dto/request/update-user-photo.dto'
import { mainDirname } from '../../root-dirname'

export class GeneratorFile {
  public static async uri(file: MessageFileDto): Promise<string> {
    const imageUri: string = `${file.tempFilePath}.${
      file.mimetype.split('/')[1]
    }`

    const dbUri: string = imageUri.split(/\\|\//)[1]

    const filePath: string = join(mainDirname, 'tmp', 'avatar', dbUri)

    await file.mv(filePath)

    return dbUri
  }
}
