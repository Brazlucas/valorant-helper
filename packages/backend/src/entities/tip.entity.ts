import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tips')
export class TipEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column()
	key!: string; // e.g., map:bind or vs:jett+sage+...

	@Column('text')
	content!: string;
}