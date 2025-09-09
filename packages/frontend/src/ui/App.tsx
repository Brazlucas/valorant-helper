import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Shuffle, 
  Zap, 
  MapPin, 
  Users, 
  Shield, 
  Swords,
  Lightbulb,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

type Agent = { name: string; role: string; tier: 'S' | 'A' | 'B' };

async function api<T>(path: string, init?: RequestInit): Promise<T> {
	const res = await fetch(`/api${path}`, init);
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	return res.json();
}

export function App() {
	const [tab, setTab] = useState<'def' | 'rand' | 'auto'>('def');
	const [agents, setAgents] = useState<Agent[]>([]);
	const [maps, setMaps] = useState<string[]>([]);

	useEffect(() => {
		api<Agent[]>('/agents').then(setAgents).catch(console.error);
		api<string[]>('/maps').then(setMaps).catch(console.error);
	}, []);

	const tabs = [
		{ id: 'def' as const, label: 'Definição & Configuração', icon: Target },
		{ id: 'rand' as const, label: 'Aleatorizador', icon: Shuffle },
		{ id: 'auto' as const, label: 'Autocomplete', icon: Zap },
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-valorant-blue via-gray-900 to-valorant-blue">
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<motion.div 
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="text-center mb-12"
				>
					<h1 className="text-5xl font-bold text-valorant-light mb-4 bg-gradient-to-r from-valorant-red to-valorant-gold bg-clip-text text-transparent">
						Valorant Helper
					</h1>
					<p className="text-gray-300 text-lg">Estratégias, composições e dicas para dominar o jogo</p>
				</motion.div>

				{/* Navigation */}
				<motion.nav 
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="flex justify-center mb-8"
				>
					<div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-2 border border-gray-700">
						{tabs.map(({ id, label, icon: Icon }) => (
							<button
								key={id}
								onClick={() => setTab(id)}
								className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
									tab === id
										? 'bg-valorant-red text-white shadow-lg'
										: 'text-gray-300 hover:text-white hover:bg-gray-700/50'
								}`}
							>
								<Icon size={20} />
								{label}
							</button>
						))}
					</div>
				</motion.nav>

				{/* Content */}
				<AnimatePresence mode="wait">
					<motion.div
						key={tab}
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
						transition={{ duration: 0.3 }}
					>
						{tab === 'def' && <Definicao agents={agents} maps={maps} />}
						{tab === 'rand' && <Aleatorizador maps={maps} />}
						{tab === 'auto' && <Autocomplete agents={agents} maps={maps} />}
					</motion.div>
				</AnimatePresence>
			</div>
		</div>
	);
}

function AgentIcon({ agentName }: { agentName: string }) {
	const getAgentIcon = (name: string) => {
		const icons: Record<string, string> = {
			'Jett': '🌪️', 'Raze': '💥', 'Reyna': '👁️', 'Phoenix': '🔥', 'Yoru': '⚡', 'Neon': '⚡', 'Iso': '🛡️', 'Tejo': '⚔️',
			'Cypher': '📹', 'Sage': '💎', 'Killjoy': '🤖', 'Chamber': '💼', 'Deadlock': '🔒', 'Waylay': '🎯',
			'Brimstone': '💨', 'Omen': '🌑', 'Viper': '☠️', 'Astra': '⭐', 'Harbor': '🌊', 'Clove': '🍀',
			'Skye': '🦅', 'Sova': '🏹', 'KAY/O': '🤖', 'Fade': '👻', 'Gekko': '🐸', 'Vyse': '🎭'
		};
		return icons[name] || '🎮';
	};

	return (
		<span className="text-lg mr-2" title={agentName}>
			{getAgentIcon(agentName)}
		</span>
	);
}

function TierBadge({ tier }: { tier: 'S' | 'A' | 'B' }) {
	const tierStyles = {
		'S': 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900 font-bold',
		'A': 'bg-gradient-to-r from-blue-400 to-blue-600 text-blue-900 font-bold',
		'B': 'bg-gradient-to-r from-gray-400 to-gray-600 text-gray-900 font-bold'
	};

	return (
		<span className={`px-2 py-1 rounded-full text-xs ${tierStyles[tier]}`}>
			{tier}
		</span>
	);
}

function MultiSelect({ options, value, onChange, placeholder, agents }: { 
	options: string[]; 
	value: string[]; 
	onChange: (v: string[]) => void;
	placeholder?: string;
	agents?: Agent[];
}) {
	const getAgentTier = (agentName: string) => {
		const agent = agents?.find(a => a.name === agentName);
		return agent?.tier || 'B';
	};

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
				{options.map(option => (
					<label key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-colors border border-gray-600/30">
						<input
							disabled={value.length >= 5 && !value.includes(option)}
							type="checkbox"
							checked={value.includes(option)}
							onChange={(e) => {
								if (e.target.checked) {
									onChange([...value, option]);
								} else {
									onChange(value.filter(v => v !== option));
								}
							}}
							className="w-4 h-4 text-valorant-red bg-gray-700 border-gray-600 rounded focus:ring-valorant-red focus:ring-2"
						/>
						<AgentIcon agentName={option} />
						<div className="flex flex-col flex-1">
							<span className="text-valorant-light text-sm font-medium">{option}</span>
							<TierBadge tier={getAgentTier(option)} />
						</div>
					</label>
				))}
			</div>
			{value.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{value.map(selected => (
						<span key={selected} className="bg-valorant-red/20 text-valorant-red px-3 py-2 rounded-full text-sm border border-valorant-red/30 flex items-center gap-2">
							<AgentIcon agentName={selected} />
							{selected}
							<TierBadge tier={getAgentTier(selected)} />
						</span>
					))}
				</div>
			)}
		</div>
	);
}

function Definicao({ agents, maps }: { agents: Agent[]; maps: string[] }) {
	const [map, setMap] = useState('Bind');
	const agentNames = useMemo(() => agents.map(a => a.name), [agents]);
	const [team, setTeam] = useState<string[]>([]);
	const [enemy, setEnemy] = useState<string[]>([]);
	const [result, setResult] = useState<{ counters: Record<string, string[]>; tips: string[] } | null>(null);
	const [loading, setLoading] = useState(false);

	async function analyze() {
		if (team.length === 0 || enemy.length === 0) return;
		setLoading(true);
		try {
			const data = await api<{ counters: Record<string, string[]>; tips: string[] }>(`/analyze`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ map, teamAgents: team, enemyAgents: enemy })
			});
			setResult(data);
		} catch (error) {
			console.error('Erro ao analisar:', error);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="max-w-6xl mx-auto">
			<div className="card">
				<div className="flex items-center gap-3 mb-6">
					<Target className="text-valorant-red" size={24} />
					<h2 className="text-2xl font-bold text-valorant-light">Análise de Partida</h2>
				</div>

				{/* Map Selection */}
				<div className="mb-8">
					<label className="block text-valorant-light font-semibold mb-3 flex items-center gap-2">
						<MapPin size={20} />
						Mapa
					</label>
					<select
						value={map} 
						onChange={(e) => setMap(e.target.value)}
						className="select-field w-full max-w-xs"
					>
						{maps.map(m => <option key={m} value={m}>{m}</option>)}
					</select>
				</div>

				{/* Team Selection */}
				<div className="grid md:grid-cols-2 gap-8 mb-8">
					<div className="card">
						<h3 className="text-xl font-semibold text-valorant-light mb-4 flex items-center gap-2">
							<Shield className="text-green-400" size={20} />
							Seu Time
						</h3>
						<MultiSelect
							options={agentNames}
							value={team}
							onChange={setTeam}
							agents={agents}
						/>
					</div>
					<div className="card">
						<h3 className="text-xl font-semibold text-valorant-light mb-4 flex items-center gap-2">
							<Swords className="text-red-400" size={20} />
							Time Inimigo
						</h3>
						<MultiSelect options={agentNames} value={enemy} onChange={setEnemy} agents={agents} />
					</div>
				</div>

				{/* Analyze Button */}
				<div className="text-center mb-8">
					<button 
						onClick={analyze} 
						disabled={team.length === 0 || enemy.length === 0 || loading}
						className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? 'Analisando...' : 'Analisar Composição'}
					</button>
				</div>

				{/* Results */}
				{result && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="space-y-6"
					>
						{/* Counters */}
						<div className="card">
							<h3 className="text-xl font-semibold text-valorant-light mb-4 flex items-center gap-2">
								<CheckCircle className="text-green-400" size={20} />
								Counters Identificados
							</h3>
							<div className="space-y-3">
								{Object.entries(result.counters).map(([ally, list]) => (
									<div key={ally} className="flex items-center gap-3">
										<span className="font-semibold text-valorant-light min-w-[100px]">{ally}:</span>
										{list.length > 0 ? (
											<div className="flex flex-wrap gap-2">
												{list.map(counter => (
													<span key={counter} className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm border border-green-500/30">
														{counter}
													</span>
												))}
											</div>
										) : (
											<span className="text-gray-400">Nenhum counter direto</span>
										)}
									</div>
								))}
							</div>
						</div>

						{/* Tips */}
						{result.tips.length > 0 && (
							<div className="card">
								<h3 className="text-xl font-semibold text-valorant-light mb-4 flex items-center gap-2">
									<Lightbulb className="text-yellow-400" size={20} />
									Dicas Estratégicas
								</h3>
								<div className="space-y-3">
									{result.tips.map((tip, i) => (
										<div key={i} className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg">
											<AlertCircle className="text-yellow-400 mt-0.5 flex-shrink-0" size={16} />
											<span className="text-valorant-light">{tip}</span>
										</div>
									))}
								</div>
							</div>
						)}
					</motion.div>
				)}
			</div>
		</div>
	);
}

function Aleatorizador({ maps }: { maps: string[] }) {
	const [map, setMap] = useState<string>('');
	const [result, setResult] = useState<{ map: string; composition: string[] } | null>(null);
	const [loading, setLoading] = useState(false);

	async function randomize() {
		setLoading(true);
		try {
			const data = await api<{ map: string; composition: string[] }>(`/randomize`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ map: map || undefined })
			});
			setResult(data);
		} catch (error) {
			console.error('Erro ao gerar composição:', error);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="max-w-4xl mx-auto">
			<div className="card">
				<div className="flex items-center gap-3 mb-6">
					<Shuffle className="text-valorant-red" size={24} />
					<h2 className="text-2xl font-bold text-valorant-light">Gerador de Composições</h2>
				</div>

				<div className="mb-8">
					<label className="block text-valorant-light font-semibold mb-3 flex items-center gap-2">
						<MapPin size={20} />
						Mapa (opcional)
					</label>
					<select
						value={map} 
						onChange={(e) => setMap(e.target.value)}
						className="select-field w-full max-w-xs"
					>
						<option value="">🎲 Aleatório</option>
						{maps.map(m => <option key={m} value={m}>{m}</option>)}
					</select>
				</div>

				<div className="text-center mb-8">
					<button 
						onClick={randomize} 
						disabled={loading}
						className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? 'Gerando...' : '🎲 Gerar Composição'}
					</button>
				</div>

				{result && (
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						className="space-y-6"
					>
						<div className="card">
							<h3 className="text-xl font-semibold text-valorant-light mb-4 flex items-center gap-2">
								<MapPin className="text-blue-400" size={20} />
								Mapa Selecionado
							</h3>
							<div className="text-2xl font-bold text-valorant-red">{result.map}</div>
						</div>

						<div className="card">
							<h3 className="text-xl font-semibold text-valorant-light mb-4 flex items-center gap-2">
								<Users className="text-green-400" size={20} />
								Composição Recomendada
							</h3>
							<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
								{result.composition.map((agent, index) => (
									<motion.div
										key={agent}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: index * 0.1 }}
										className="bg-valorant-red/20 border border-valorant-red/30 rounded-lg p-4 text-center"
									>
										<div className="text-valorant-light font-semibold">{agent}</div>
									</motion.div>
								))}
							</div>
						</div>
					</motion.div>
				)}
			</div>
		</div>
	);
}

function Autocomplete({ agents, maps }: { agents: Agent[]; maps: string[] }) {
	const agentNames = useMemo(() => agents.map(a => a.name), [agents]);
	const [map, setMap] = useState('Bind');
	const [picks, setPicks] = useState<string[]>([]);
	const [suggestions, setSuggestions] = useState<{ agent: string; score: number }[]>([]);
	const [loading, setLoading] = useState(false);

	async function suggest() {
		if (picks.length === 0) return;
		setLoading(true);
		try {
			const data = await api<{ suggestions: { agent: string; score: number }[] }>(`/suggest`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ map, picks, teamSize: 5 })
			});
			setSuggestions(data.suggestions);
		} catch (error) {
			console.error('Erro ao obter sugestões:', error);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="max-w-6xl mx-auto">
			<div className="card">
				<div className="flex items-center gap-3 mb-6">
					<Zap className="text-valorant-red" size={24} />
					<h2 className="text-2xl font-bold text-valorant-light">Sugestões Inteligentes</h2>
				</div>

				{/* Map Selection */}
				<div className="mb-8">
					<label className="block text-valorant-light font-semibold mb-3 flex items-center gap-2">
						<MapPin size={20} />
						Mapa
					</label>
					<select 
						value={map} 
						onChange={(e) => setMap(e.target.value)}
						className="select-field w-full max-w-xs"
					>
						{maps.map(m => <option key={m} value={m}>{m}</option>)}
					</select>
				</div>

				{/* Agent Selection */}
				<div className="mb-8">
					<h3 className="text-xl font-semibold text-valorant-light mb-4 flex items-center gap-2">
						<Users className="text-blue-400" size={20} />
						Agentes Já Escolhidos
					</h3>
					<MultiSelect options={agentNames} value={picks} onChange={setPicks} agents={agents} />
					{picks.length > 0 && (
						<div className="mt-4 text-sm text-gray-400">
							Faltam {5 - picks.length} agente(s) para completar o time
						</div>
					)}
				</div>

				{/* Suggest Button */}
				<div className="text-center mb-8">
					<button 
						onClick={suggest} 
						disabled={picks.length === 0 || loading}
						className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? 'Analisando...' : '💡 Obter Sugestões'}
					</button>
				</div>

				{/* Suggestions */}
				{suggestions.length > 0 && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="card"
					>
						<h3 className="text-xl font-semibold text-valorant-light mb-4 flex items-center gap-2">
							<Lightbulb className="text-yellow-400" size={20} />
							Sugestões de Agentes
						</h3>
						<div className="grid gap-3">
							{suggestions.map((suggestion, index) => (
								<motion.div
									key={suggestion.agent}
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: index * 0.1 }}
									className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600"
								>
									<div className="flex items-center gap-3">
										<div className="w-8 h-8 bg-valorant-red/20 rounded-full flex items-center justify-center text-valorant-red font-bold">
											{index + 1}
										</div>
										<span className="text-valorant-light font-semibold text-lg">{suggestion.agent}</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="text-sm text-gray-400">Score:</div>
										<div className="bg-valorant-red/20 text-valorant-red px-3 py-1 rounded-full text-sm font-semibold">
											{suggestion.score.toFixed(1)}
										</div>
									</div>
								</motion.div>
							))}
						</div>
					</motion.div>
				)}
			</div>
		</div>
	);
}