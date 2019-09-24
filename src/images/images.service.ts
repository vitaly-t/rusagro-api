import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';

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
    images.forEach(image => {
      values.push({
        image,
        original_name: image.originalname,
        mimetype: image.mimetype,
        size: image.size,
        answer_id: null,
      });
    });
    const columns = ['image', 'original_name', 'mimetype', 'size', 'answer_id'];
    const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    const dbres = await this.db.insertCS(columns, 'images', values);
    return dbres.map(id => fullUrl + '/' + id);
  }
}
