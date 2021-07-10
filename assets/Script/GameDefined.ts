/* 主角血量 */
export const RoleBlood = 10;
/* 通关血量 */
export const BossBlood = -10;
/* 卡片组合 */
export const CardsSequence: number[][] = [
  [1, 1, 1, 2, 2, 2, 2, 3, 3, 4, 5, -1, -1, -2, -2, -3, -4, -5], // 26 - 18 = 8
  [1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5, -1, -2, -3, -4, -4, -4, -5], // 30 - 23 = 7
  [1, 1, 2, 2, 3, 3, 4, 4, 5, -1, -2, -2, -3, -3, -4, -4, -5, -5], // 25 - 29 = -4
  [1, 1, 2, 2, 3, 3, 4, 5, -1, -1, -2, -2, -3, -3, -4, -4, -5, -5], // 21 - 30 = -9
];