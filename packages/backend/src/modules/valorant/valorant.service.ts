import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentEntity } from '../../entities/agent.entity';
import { MapEntity } from '../../entities/map.entity';
import { TipEntity } from '../../entities/tip.entity';

export type Agent = {
	name: string;
	role: 'Duelist' | 'Controller' | 'Sentinel' | 'Initiator';
};

@Injectable()
export class ValorantService {
	constructor(
		@InjectRepository(AgentEntity) private readonly agentRepo: Repository<AgentEntity>,
		@InjectRepository(MapEntity) private readonly mapRepo: Repository<MapEntity>,
		@InjectRepository(TipEntity) private readonly tipRepo: Repository<TipEntity>,
	) {}

	async getAgents(): Promise<Agent[]> {
		const agents = await this.agentRepo.find();
		return agents.map(a => ({ name: a.name, role: a.role }));
	}

	async getMaps(): Promise<string[]> {
		const maps = await this.mapRepo.find();
		return maps.map(m => m.name);
	}

	async analyzeMatch(map: string, teamAgents: string[], enemyAgents: string[]) {
		const agents = await this.agentRepo.find({ relations: ['counters'] });
		const agentByName = new Map(agents.map(a => [a.name.toLowerCase(), a] as const));
		const lowerEnemy = enemyAgents.map(a => a.toLowerCase());
		const counters: Record<string, string[]> = {};
		for (const ally of teamAgents) {
			const agent = agentByName.get(ally.toLowerCase());
			if (!agent) continue;
			counters[agent.name] = (agent.counters || []).map(c => c.name).filter(n => lowerEnemy.includes(n.toLowerCase()));
		}
		const enemySignature = [...lowerEnemy].sort().join('+');
		const mapTips = await this.tipRepo.find({ where: { key: `map:${map.toLowerCase()}` } });
		const compTips = await this.tipRepo.find({ where: { key: `vs:${enemySignature}` } });
		return { counters, tips: [...mapTips, ...compTips].map(t => t.content) };
	}

	async suggestAgents(map: string, picks: string[], teamSize: number = 5) {
		const remaining = teamSize - picks.length;
		if (remaining <= 0) return { picks, suggestions: [] };
		const allAgents = await this.agentRepo.find({ relations: ['mapPreferences', 'synergies'] });
		const pickSet = new Set(picks.map(p => p.toLowerCase()));
		const scored = allAgents
			.filter(a => !pickSet.has(a.name.toLowerCase()))
			.map(a => ({ agent: a.name, score: this.scoreAgent(a, map, picks, allAgents) }))
			.sort((a, b) => b.score - a.score);
		return { suggestions: scored.slice(0, remaining) };
	}

	async randomize(map?: string) {
		const maps = await this.getMaps();
		const chosenMap = map ?? maps[Math.floor(Math.random() * maps.length)];
		const composition: string[] = [];
		for (let i = 0; i < 5; i++) {
			const { suggestions } = await this.suggestAgents(chosenMap, composition, 5);
			const pick = suggestions[0]?.agent ?? (await this.pickAny(composition));
			if (pick) composition.push(pick);
		}
		return { map: chosenMap, composition };
	}

	private async pickAny(existing: string[]): Promise<string | undefined> {
		const options = await this.agentRepo.find();
		const existingSet = new Set(existing.map(e => e.toLowerCase()));
		const filtered = options.filter(a => !existingSet.has(a.name.toLowerCase()));
		return filtered[Math.floor(Math.random() * filtered.length)]?.name;
	}

	private scoreAgent(agent: AgentEntity, map: string, currentPicks: string[], allAgents: AgentEntity[]): number {
		let score = 0;
		if ((agent.mapPreferences || []).some(m => m.name.toLowerCase() === map.toLowerCase())) score += 3;
		const currentAgents = currentPicks
			.map(p => allAgents.find(a => a.name.toLowerCase() === p.toLowerCase()))
			.filter(Boolean) as AgentEntity[];
		const roles = new Set(currentAgents.map(a => a.role));
		if (!roles.has(agent.role)) score += 2; else score += 0.5;
		const lowerPicks = currentPicks.map(p => p.toLowerCase());
		score += (agent.synergies || []).filter(s => lowerPicks.includes(s.name.toLowerCase())).length * 1.5;
		if (lowerPicks.includes(agent.name.toLowerCase())) score = -Infinity;
		return score;
	}
}