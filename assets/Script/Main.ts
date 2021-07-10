import { CardsSequence, RoleBlood } from "./GameDefined";
import Card from "./Card";
import { random, shuffle, sleep } from "./Utils";
const { ccclass, property } = cc._decorator;

/* 攻击关系 */
const AttackRelation = [
  [1, 3],
  [0, 2, 4],
  [1, 5],
  [0, 4, 6],
  [1, 3, 5, 7],
  [2, 4, 8],
  [3, 7],
  [4, 6, 8],
  [5, 7],
];
const StartPos = cc.v2(0, 500);

@ccclass
export default class Main extends cc.Component {
  @property(cc.Prefab) cardPrefab: cc.Prefab = null;
  @property(cc.Node) cardsSlotBgBox: cc.Node = null;
  @property(cc.Node) cardsSlotBox: cc.Node = null;

  /* 卡片节点池 */
  private cardsPool: cc.NodePool = null;
  /* 卡片位置图 */
  seatsPosRecord: cc.Vec2[] = [];
  /* 桌上的卡片集合 */
  onTableCards: cc.Node[] = [];
  /* 我的位置索引 */
  mineIdx: number = 4;
  /* 我的血 */
  mineBlood: number = 0;
  mineCard: cc.Node;
  /* 当前的游戏组合 */
  combination: number[] = [];
  /* 锁定操作 */
  lock: boolean = false;

  onLoad() {
    this.init();
    this.restart();
  }

  init() {
    this.initCardsPool();
    this.node.on("attack", this.attack.bind(this));

    this.seatsPosRecord = this.cardsSlotBgBox.children.map((node) => {
      return node.getPosition();
    });
  }

  async attack(event: cc.Event) {
    const cardNode = event.target as cc.Node;
    const card = cardNode.getComponent(Card);
    const { score, index, isMe } = card;

    if (this.lock) return;
    this.lock = true;

    console.log(cardNode.uuid, score, index);

    if (isMe) {
      this.onTableCards[index].getComponent(Card).shake();
    } else {
      // 判断位置关系
      const attackRange = AttackRelation[this.mineIdx];
      const noTouch = attackRange.indexOf(index) == -1;
      const curCard = this.onTableCards[index];
      console.log(index, this.mineIdx, noTouch, attackRange);
      if (noTouch) {
        // 碰不到，抖动
        // TODO: 箭头提示
        curCard.getComponent(Card).shake();
        this.lock = false;
      } else {
        // ! hack操作，锁定用户操作
        this.scheduleOnce(() => {
          this.lock = false;
        }, 2);
        const newBlood = this.mineBlood + score;
        console.log(111, this.mineBlood, score);
        card.cardHurt(newBlood >= 0);
        await sleep(800);
        if (newBlood >= 0) {
          const mineCardCmp = this.mineCard.getComponent(Card);
          // 扣血
          mineCardCmp.setScore(newBlood);
          this.mineBlood = newBlood;

          // 回收卡片 & 移动位置
          const _oldIdx = this.mineIdx;
          mineCardCmp.cardMove(
            0.6,
            this.cardsSlotBgBox.children[index].getPosition()
          );
          mineCardCmp.setIndex(index);
          this.mineIdx = index;
          await sleep(1000);
          this.makeACard(
            _oldIdx,
            this.cardsSlotBgBox.children[_oldIdx].getPosition()
          );
          this.cardsPool.put(curCard);
        } else {
          // TODO: 游戏结束
          console.log("GAME_over");
        }
      }
    }
  }

  initCardsPool() {
    this.cardsPool = new cc.NodePool();
    new cc.NodePool();
    // 九张卡片，加两张新卡片
    for (let count = 0; count < 11; count++) {
      this.cardsPool.put(cc.instantiate(this.cardPrefab));
    }
  }

  makeACard(index: number, endPos: cc.Vec2) {
    const card = this.cardsPool.get();
    const cardCmp = card.getComponent(Card);
    // TODO: 分数没有, 要出大boss;然后随机出牌
    const score = this.combination.pop();
    //@ts-ignore
    cardCmp.init(score, endPos, index, false, StartPos);
    this.onTableCards[index] = card;
    this.cardsSlotBox.addChild(card);
  }

  restart() {
    const cardsSequenceIdx = random(0, CardsSequence.length - 1);
    this.combination = shuffle(CardsSequence[cardsSequenceIdx]);

    this.mineIdx = 4;
    this.mineBlood = RoleBlood;

    for (let count = 0; count < 9; count++) {
      const isMe = count == 4;
      const cardScore = isMe ? this.mineBlood : this.combination.pop();
      const card = this.cardsPool.get();
      const endPos = this.cardsSlotBgBox.children[count].getPosition();

      //@ts-ignore
      card.getComponent(Card).init(cardScore, endPos, count, isMe, StartPos);
      this.onTableCards.push(card);
      this.cardsSlotBox.addChild(card);
      if (isMe) this.mineCard = card;
    }
  }
}
