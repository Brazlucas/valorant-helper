import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValorantService } from './valorant.service';
import { ValorantController } from './valorant.controller';
import { AgentEntity } from '../../entities/agent.entity';
import { MapEntity } from '../../entities/map.entity';
import { TipEntity } from '../../entities/tip.entity';
import { ValorantSeeder } from './valorant.seeder';

@Module({
	imports: [TypeOrmModule.forFeature([AgentEntity, MapEntity, TipEntity])],
	providers: [ValorantService, ValorantSeeder],
	controllers: [ValorantController],
})
export class ValorantModule {}