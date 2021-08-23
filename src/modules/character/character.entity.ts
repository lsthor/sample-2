import { Column, Entity, PrimaryColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity({ name: 'characters' })
export default class Character {
  @PrimaryColumn()
  public id: number;

  @Column()
  public name: string;

  @Column()
  public description: string;

  @Column()
  @Exclude()
  public etag: string;
}
