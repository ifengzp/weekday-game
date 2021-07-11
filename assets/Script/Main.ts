import { BossBlood, CardsSequence, RoleBlood, TipsMap } from "./GameDefined";
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

@ccclass
export default class Main extends cc.Component {
  @property(cc.Prefab) cardPrefab: cc.Prefab = null;
  @property(cc.Node) cardsSlotBgBox: cc.Node = null;
  @property(cc.Node) cardsSlotBox: cc.Node = null;
  @property(cc.Node) countNode: cc.Node = null;
  @property(cc.Label) countLabel: cc.Label = null;
  @property(cc.Node) ending: cc.Node = null;
  @property(cc.Node) tipsNode: cc.Node = null;
  @property(cc.Label) tipsLabel: cc.Label = null;

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
  /* 发牌起点坐标 */
  cardStartPos: cc.Vec2 = null;
  isRandomTime: boolean = false;

  onLoad() {
    // !hack骚操作，不想转换坐标了，因为那个节点用的是widget，所以可以算出来，这个位置相对是固定的
    const { width, height } = cc.view.getVisibleSize();
    this.cardStartPos = cc.v2(-width / 2, height / 2).subtract(cc.v2(-80, 70));

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

  showTip(score) {
    const tipItem = TipsMap.find((item) => item.val == score);
    this.tipsNode.active = true;
    this.tipsNode.opacity = 0;
    this.tipsLabel.string =
      tipItem && tipItem.tip ? tipItem.tip : "疲惫让我合上了电脑";

    cc.tween(this.tipsNode)
      .to(0.5, {
        opacity: 255,
      })
      .delay(0.5)
      .to(0.5, { opacity: 0 })
      .start();
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
        const isBoss = curCard.getComponent(Card).isBoss;
        this.showTip(score);
        console.log(111, this.mineBlood, score);
        card.cardHurt(newBlood >= 0 && !isBoss);
        await sleep(800);
        if (newBlood >= 0) {
          // 还活着
          const mineCardCmp = this.mineCard.getComponent(Card);
          // 扣血
          mineCardCmp.setScore(newBlood);
          this.mineBlood = newBlood;

          if (isBoss) {
            // 是boss，赢了
            this.gameOver(true);
            return;
          }

          // 回收卡片 & 移动位置
          const _oldIdx = this.mineIdx;
          mineCardCmp.cardMove({
            duration: 1,
            stScale: 1,
            endPos: this.cardsSlotBgBox.children[index].getPosition(),
          });
          mineCardCmp.setIndex(index);
          this.mineIdx = index;
          await sleep(1000);
          this.makeACard(
            _oldIdx,
            this.cardsSlotBgBox.children[_oldIdx].getPosition()
          );
          this.cardsPool.put(curCard);
        } else {
          this.gameOver(false);
        }
      }
    }
  }

  gameOver(success: boolean) {
    console.log("GAME_over", success);
    this.tipsNode.active = false;
    this.tipsNode.opacity = 0;

    // 回收卡片
    this.scheduleOnce(() => {
      this.onTableCards.forEach((cards) => this.cardsPool.put(cards));
      this.onTableCards = [];
      this.cardsPool.put(this.mineCard);
    }, 0.6);

    this.node.dispatchEvent(
      new cc.Event.EventCustom(success ? "gameWin" : "gameFail", true)
    );
  }

  initCardsPool() {
    this.cardsPool = new cc.NodePool();
    new cc.NodePool();
    // 九张卡片，加两张新卡片
    for (let count = 0; count < 30; count++) {
      this.cardsPool.put(cc.instantiate(this.cardPrefab));
    }
  }

  async makeACard(index: number, endPos: cc.Vec2) {
    const card = this.cardsPool.get();
    const cardCmp = card.getComponent(Card);
    if (this.combination.length <= 0 && !this.isRandomTime) {
      // 出大boss，然后随机出牌
      this.isRandomTime = true;
      this.ending.opacity = 255;
      this.ending.active = true;
      this.ending.getComponent(cc.Animation).play();
      await sleep(1500);
      cc.tween(this.ending)
        .to(1, { opacity: 0 })
        .call(() => {
          this.ending.active = false;
        })
        .start();
      cardCmp.init(BossBlood, index, false, true);
      cardCmp.cardMove({
        duration: 0.5,
        stScale: 1,
        stPos: cc.v2(0, 0),
        endPos: endPos,
      });
      this.onTableCards[index] = card;
      this.cardsSlotBox.addChild(card);
      return;
    } else {
      this.countLabel.string = String(this.combination.length || "Boss");
      const score = this.isRandomTime
        ? Math.random() > 0.5
          ? random(0, 3)
          : -random(0, 3)
        : this.combination.pop();
      cardCmp.init(score, index, false);
      cardCmp.cardMove({
        duration: 0.5,
        stScale: 0.2,
        stPos: this.cardStartPos,
        endPos: endPos,
      });

      this.onTableCards[index] = card;
      this.cardsSlotBox.addChild(card);
    }
  }

  restart() {
    this.isRandomTime = false;
    const cardsSequenceIdx = random(0, CardsSequence.length - 1);
    this.combination = shuffle(CardsSequence[cardsSequenceIdx]);

    this.mineIdx = 4;
    this.mineBlood = RoleBlood;

    for (let count = 0; count < 9; count++) {
      const isMe = count == 4;
      const cardScore = isMe
        ? this.mineBlood
        : this.isRandomTime
        ? Math.random() > 0.5
          ? random(0, 6)
          : -random(0, 6)
        : this.combination.pop();
      const card = this.cardsPool.get();
      const endPos = this.cardsSlotBgBox.children[count].getPosition();

      card.getComponent(Card).init(cardScore, count, isMe);
      card.getComponent(Card).cardMove({
        duration: 0.5,
        stScale: 0.2,
        stPos: this.cardStartPos,
        endPos: endPos,
        delay: count * 0.08,
      });

      this.onTableCards.push(card);
      this.cardsSlotBox.addChild(card);
      if (isMe) this.mineCard = card;
    }
    this.countLabel.string = String(this.combination.length + 1);
  }
}
