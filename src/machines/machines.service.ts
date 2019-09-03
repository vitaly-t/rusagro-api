import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';

@Injectable()
export class MachinesService {
  constructor(private readonly db: DbService) {
  }

  async findAll(departmentId: number) {
    const query = `select m.id, m.inventory_number as "inventoryNumber",
    m.latitude, m.longitude,  m.plate_number as "plateNumber", m.gps_imei as "gpsImei",
    m2.brand, t.type from machines m
    join machine_brands m2 on m.brand_id = m2.id
    join machine_types t on m.type_id = t.id
    where m.department_id = $1`;
    return await this.db.find(query, [departmentId]);
  }

  async findOne(id: number) {
    const query = `select m.id, m.plate_number as "plateNumber",
    m.inventory_number as "inventoryNumber",
    m.gps_imei, m2.brand, t.type from machines m
    join machine_brands m2 on m.brand_id = m2.id
    join machine_types t on m.type_id = t.id
    where m.id = $1`;
    return await this.db.findOne(query, [id]);
  }
}
