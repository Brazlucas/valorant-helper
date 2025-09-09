import { Module } from '@nestjs/common';
import { ValorantModule } from './modules/valorant/valorant.module';
import { HealthController } from './controllers/health.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentEntity } from './entities/agent.entity';
import { MapEntity } from './entities/map.entity';
import { TipEntity } from './entities/tip.entity';

@Module({
	imports: [
		TypeOrmModule.forRoot({
			type: 'sqlite',
			database: 'data.sqlite',
			entities: [AgentEntity, MapEntity, TipEntity],
			synchronize: true,
			logging: false,
		}),
		ValorantModule,
	],
	controllers: [HealthController],
})
export class AppModule {}