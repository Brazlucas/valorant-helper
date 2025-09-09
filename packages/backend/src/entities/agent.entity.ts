import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { MapEntity } from './map.entity';

@Entity('agents')
export class AgentEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ unique: true })
	name!: string;

	@Column()
	role!: 'Duelist' | 'Controller' | 'Sentinel' | 'Initiator';

	@Column()
	tier!: 'S' | 'A' | 'B';

	@ManyToMany(() => AgentEntity)
	@JoinTable({ name: 'agent_counters' })
	counters!: AgentEntity[];

	@ManyToMany(() => AgentEntity)
	@JoinTable({ name: 'agent_weak_against' })
	tweakAgainst!: AgentEntity[];

	@ManyToMany(() => MapEntity, (m) => m.agents)
	@JoinTable({ name: 'agent_map_preferences' })
	mapPreferences!: MapEntity[];

	@ManyToMany(() => AgentEntity)
	@JoinTable({ name: 'agent_synergies' })
	synergies!: AgentEntity[];
}