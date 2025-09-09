import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
	app.enableCors({
		origin: true,
		credentials: true,
	});
	await app.listen(3000, '0.0.0.0');
	// eslint-disable-next-line no-console
	console.log('Backend running on http://localhost:3000');
}

bootstrap();