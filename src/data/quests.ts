export interface QuestDef {
  id: string;
  name: string;
  desc: string;
  /** 目标类型 */
  type: 'cultivate' | 'outing' | 'battle_win' | 'breakthrough' | 'recruit' | 'alchemy' | 'learn_tech';
  target: number;
  rewardStone: number;
  rewardQi: number;
  rewardFame: number;
  rewardInsight?: number;
}

export const QUESTS: QuestDef[] = [
  {
    id: 'q_cultivate_5',
    name: '勤修不辍',
    desc: '闭关 5 次',
    type: 'cultivate',
    target: 5,
    rewardStone: 40,
    rewardQi: 10,
    rewardFame: 5,
  },
  {
    id: 'q_outing_3',
    name: '初涉江湖',
    desc: '外出历练 3 次',
    type: 'outing',
    target: 3,
    rewardStone: 30,
    rewardQi: 8,
    rewardFame: 8,
  },
  {
    id: 'q_win_2',
    name: '初试锋芒',
    desc: '战斗胜利 2 次',
    type: 'battle_win',
    target: 2,
    rewardStone: 50,
    rewardQi: 5,
    rewardFame: 12,
  },
  {
    id: 'q_break_1',
    name: '更进一步',
    desc: '成功突破 1 次',
    type: 'breakthrough',
    target: 1,
    rewardStone: 80,
    rewardQi: 15,
    rewardFame: 15,
    rewardInsight: 5,
  },
  {
    id: 'q_recruit_1',
    name: '开枝散叶',
    desc: '收徒 1 人',
    type: 'recruit',
    target: 1,
    rewardStone: 35,
    rewardQi: 5,
    rewardFame: 10,
  },
  {
    id: 'q_alchemy_3',
    name: '丹道入门',
    desc: '炼丹成功 3 次',
    type: 'alchemy',
    target: 3,
    rewardStone: 45,
    rewardQi: 12,
    rewardFame: 8,
    rewardInsight: 4,
  },
  {
    id: 'q_tech_1',
    name: '功法初成',
    desc: '学会 1 门功法',
    type: 'learn_tech',
    target: 1,
    rewardStone: 60,
    rewardQi: 10,
    rewardFame: 10,
    rewardInsight: 8,
  },
];

export function getQuest(id: string): QuestDef | undefined {
  return QUESTS.find((q) => q.id === id);
}
