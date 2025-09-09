import { Body, Controller, Get, Post } from '@nestjs/common';
import { ValorantService } from './valorant.service';

@Controller()
export class ValorantController {
	constructor(private readonly service: ValorantService) {}

	@Get('agents')
	getAgents() { return this.service.getAgents(); }

	@Get('maps')
	getMaps() { return this.service.getMaps(); }

	@Post('analyze')
	analyze(@Body() body: { map: string; teamAgents: string[]; enemyAgents: string[]; }) {
		return this.service.analyzeMatch(body.map, body.teamAgents ?? [], body.enemyAgents ?? []);
	}

	@Post('suggest')
	suggest(@Body() body: { map: string; picks: string[]; teamSize?: number; }) {
		return this.service.suggestAgents(body.map, body.picks ?? [], body.teamSize ?? 5);
	}

	@Post('randomize')
	randomize(@Body() body: { map?: string }) {
		return this.service.randomize(body?.map);
	}
}