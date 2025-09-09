import fs from 'node:fs';
import path from 'node:path';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentEntity } from '../../entities/agent.entity';
import { MapEntity } from '../../entities/map.entity';
import { TipEntity } from '../../entities/tip.entity';

@Injectable()
export class ValorantSeeder implements OnApplicationBootstrap {
	constructor(
		@InjectRepository(AgentEntity) private readonly agentRepo: Repository<AgentEntity>,
		@InjectRepository(MapEntity) private readonly mapRepo: Repository<MapEntity>,
		@InjectRepository(TipEntity) private readonly tipRepo: Repository<TipEntity>,
	) {}

	async onApplicationBootstrap() {
		const agentsCount = await this.agentRepo.count();
		if (agentsCount > 0) return; // already seeded
		const dataDir = path.resolve(__dirname, '../../data');
		const agentsJson = JSON.parse(fs.readFileSync(path.join(dataDir, 'agents.json'), 'utf-8')) as Array<{
			name: string; role: any; tier: 'S' | 'A' | 'B'; counters: string[]; tweakAgainst: string[]; mapPreferences: string[]; synergies: string[];
		}>;
		const mapsJson = JSON.parse(fs.readFileSync(path.join(dataDir, 'maps.json'), 'utf-8')) as string[];
		const tipsJson = JSON.parse(fs.readFileSync(path.join(dataDir, 'tips.json'), 'utf-8')) as Record<string, string[]>;

		const mapEntities = new Map<string, MapEntity>();
		for (const name of mapsJson) {
			const m = this.mapRepo.create({ name });
			await this.mapRepo.save(m);
			mapEntities.set(name.toLowerCase(), m);
		}

		const agentEntities = new Map<string, AgentEntity>();
		for (const a of agentsJson) {
			const ent = this.agentRepo.create({ name: a.name, role: a.role, tier: a.tier });
			await this.agentRepo.save(ent);
			agentEntities.set(a.name.toLowerCase(), ent);
		}

		for (const a of agentsJson) {
			const ent = agentEntities.get(a.name.toLowerCase())!;
			ent.counters = a.counters.map(n => agentEntities.get(n.toLowerCase())!).filter(Boolean);
			ent.tweakAgainst = a.tweakAgainst.map(n => agentEntities.get(n.toLowerCase())!).filter(Boolean);
			ent.mapPreferences = a.mapPreferences.map(n => mapEntities.get(n.toLowerCase())!).filter(Boolean);
			ent.synergies = a.synergies.map(n => agentEntities.get(n.toLowerCase())!).filter(Boolean);
			await this.agentRepo.save(ent);
		}

		for (const [key, list] of Object.entries(tipsJson)) {
			for (const content of list) {
				await this.tipRepo.save(this.tipRepo.create({ key, content }));
			}
		}
	}
}