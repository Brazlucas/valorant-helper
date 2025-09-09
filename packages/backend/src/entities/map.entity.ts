import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AgentEntity } from './agent.entity';

@Entity('maps')
export class MapEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ unique: true })
	name!: string;

	@ManyToMany(() => AgentEntity, (a) => a.mapPreferences)
	agents!: AgentEntity[];
}