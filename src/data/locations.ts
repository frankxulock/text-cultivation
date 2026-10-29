export type LocationId = 'mountain' | 'market' | 'ruins';

export interface LocationDef {
  id: LocationId;
  name: string;
  desc: string;
  days: number;
  minRealm: number;
  /** 战斗权重加成 */
  battleBias: number;
  /** 声望变化倾向：正=行侠，负=夺宝风险 */
  fameBias: number;
  eventTags: Array<'herb' | 'stone' | 'battle' | 'trade' | 'relic' | 'idle'>;
}

export const LOCATIONS: LocationDef[] = [
  {
    id: 'mountain',
    name: '深山',
    desc: '灵草妖兽皆有，适合稳健历练。',
    days: 2,
    minRealm: 0,
    battleBias: 0.35,
    fameBias: 0,
    eventTags: ['herb', 'battle', 'idle', 'stone'],
  },
  {
    id: 'market',
    name: '坊市',
    desc: '交易丹器、打探消息，偶遇争执。',
    days: 1,
    minRealm: 1,
    battleBias: 0.15,
    fameBias: 0.1,
    eventTags: ['trade', 'stone', 'idle', 'battle'],
  },
  {
    id: 'ruins',
    name: '秘境',
    desc: '机缘丰厚，危险亦甚。',
    days: 3,
    minRealm: 4,
    battleBias: 0.55,
    fameBias: -0.05,
    eventTags: ['relic', 'battle', 'stone', 'herb'],
  },
];

export function getLocation(id: LocationId): LocationDef {
  const found = LOCATIONS.find((l) => l.id === id);
  if (!found) {
    throw new Error(`Unknown location: ${id}`);
  }
  return found;
}
