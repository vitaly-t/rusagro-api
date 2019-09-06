import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import * as sharp from 'sharp';

@Injectable()
export class ImagesService {
  constructor(private readonly db: DbService) {
  }

  async findOne(imageId: number) {
    const query = 'select image from images where id = $1';
    const dbres = await this.db.findOne(query, [imageId]);
    return dbres.image;
  }

  async saveImages(images, req) {
    const values = [];
    // TODO: async\await map
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      try {
        const image = await sharp(file.buffer).resize(500).toBuffer();
        values.push({
          image,
          original_name: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          answer_id: null,
        });
      } catch (e) {
        console.log(e);
      }
    }
    const columns = ['image', 'original_name', 'mimetype', 'size', 'answer_id'];
    const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    const dbres = await this.db.insertCS(columns, 'images', values);
    return dbres.map(id => fullUrl + '/' + id);
  }
}
