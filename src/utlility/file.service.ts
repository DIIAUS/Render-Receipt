import { Injectable } from '@nestjs/common';
import * as fs from 'fs-extra';

@Injectable()
export class FileService {
  async convertImageToBase64(filePath: string): Promise<string> {
    try {
      const fileData = await fs.readFile(filePath);
      const base64String = fileData.toString('base64');
      return base64String;
    } catch (error) {
      console.error('Error reading the file:', error);
      throw new Error('Failed to convert image to Base64.');
    }
  }
}
