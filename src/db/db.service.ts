import { Injectable } from '@nestjs/common';
import * as pgPromise from 'pg-promise';
import { User } from '../users/user.interface';
import { ITxOption } from './tx-option.interface';

@Injectable()
export class DbService {
  private readonly pgp = pgPromise();
  private readonly connection = 'postgres://qxelholmaeucta:1e52fa294d8130cfdeb98c5619dfb8235280c683ef859f2d3090da2b555ddfb7@ec2-54-246-121-32.eu-west-1.compute.amazonaws.com:5432/d3h6k1kepkg9hd?ssl=true';
  private readonly db = this.pgp(this.connection);

  async findOne(query: string, values?: any[]) {
    return await this.db.one(query, values);
  }

  async find(query: string, values?: any[]) {
    return await this.db.any(query, values);
  }

  async none(query: string, values?: any[]) {
    return await this.db.none(query, values);
  }

  async getUserById(id: number): Promise<User> {
    const query = `select id, username, first_name as "firstName",
    last_name as "lastName", email, phone
    from users where id = $1 and disabled = false`;
    return await this.db.one(query, [id]);
  }

  async createAsnwer(userId, machineId, images) {
    const cs = new this.pgp.helpers.ColumnSet(['image', 'original_name', 'mimetype', 'size', 'answer_id'], { table: 'images' });
    const values = [];
    images.forEach(image => {
      values.push({
        image,
        original_name: image.originalname,
        mimetype: image.mimetype,
        size: image.size,
      });
    });
    const aQuery = 'insert into answers (user_id, sss_id) values ($1, $2) returning id';
    return await this.db.tx(t => {
      return t.one(aQuery, [userId, machineId], a => +a.id)
        .then(id => {
          values.forEach(v => v.answer_id = id);
          const query = this.pgp.helpers.insert(values, cs);
          t.none(query);
          return { answerId: id };
        });
    });
  }

  // [ {method: 'none', query: '', values: []}. {} ]
  async tx(opts: ITxOption[]) {
    return await this.db.tx(t => {
      const ts = opts.map(opt => t[opt.method](opt.query, opt.values));
      return t.batch(ts);
    });
  }

  async insertCS(columns: string[], table: string, values: any[]) {
    const cs = new this.pgp.helpers.ColumnSet(columns, { table });
    const query = this.pgp.helpers.insert(values, cs) + 'returning id';
    return await this.db.map(query, [], a => +a.id);
  }
}
