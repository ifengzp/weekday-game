import { random } from "./Utils";
const { ccclass, property } = cc._decorator;

@ccclass
export default class Card extends cc.Component {
  @property([cc.SpriteFrame]) positiveCover: cc.SpriteFrame[] = [];
  @property([cc.SpriteFrame]) negativeCover: cc.SpriteFrame[] = [];
  @property([cc.SpriteFrame]) mineStatus: cc.SpriteFrame[] = [];
  @property(cc.SpriteFrame) mineCover: cc.SpriteFrame = null;
  @property(cc.SpriteFrame) endingCover: cc.SpriteFrame = null;

  @property(cc.Label) scoreLabel: cc.Label = null;
  @property(cc.Node) hurtMask: cc.Node = null;
  @property(cc.Node) hurtBling: cc.Node = null;
  @property(cc.Node) mineNode: cc.Node = null;

  score: number = 0;
  index: number = 0;
  isMe: boolean = false;
  isBoss: boolean = false;

  init(score: number, index: number, isMe = false, isBoss = false) {
    this.setScore(score);

    // reset 一些状态
    this.node.opacity = 255;
    this.hurtMask.opacity = 0;
    this.hurtBling.opacity = 0;
    this.hurtBling.setScale(0.5);
    this.mineNode.active = false;
    this.isBoss = isBoss;

    this.index = index;
    this.isMe = isMe;
    if (isMe) {
      this.node.getComponent(cc.Sprite).spriteFrame = this.mineCover;
      this.mineNode.active = true;
      this.mineNode.getComponent(cc.Sprite).spriteFrame =
        score > 6
          ? this.mineStatus[0]
          : score > 4
          ? this.mineStatus[1]
          : this.mineStatus[2];
    } else if (isBoss) {
      this.node.getComponent(cc.Sprite).spriteFrame = this.endingCover;
    } else {
      const coverList = score > 0 ? this.positiveCover : this.negativeCover;
      const idx = random(0, coverList.length - 1);
      this.node.getComponent(cc.Sprite).spriteFrame = coverList[idx];
    }
  }

  setIndex(index: number) {
    this.index = index;
  }

  setScore(score: number) {
    this.score = score;
    this.scoreLabel.string = String(score);
    if (this.isMe) {
      this.mineNode.getComponent(cc.Sprite).spriteFrame =
        score > 6
          ? this.mineStatus[0]
          : score > 4
          ? this.mineStatus[1]
          : this.mineStatus[2];
    }
  }

  cardMove(data: {
    duration: number;
    stScale: number;
    endPos: cc.Vec2;
    stPos?: cc.Vec2;
    delay?: number;
  }) {
    const { duration, stScale, endPos, stPos, delay } = data;
    if (stPos) this.node.setPosition(stPos);
    this.node.setScale(stScale);
    delay
      ? cc
          .tween(this.node)
          .delay(delay)
          .to(duration, { position: endPos, scale: 1 })
          .start()
      : cc
          .tween(this.node)
          .to(duration, { position: endPos, scale: 1 })
          .start();
  }
  shake() {
    const pos = this.node.getPosition();
    this.node.stopAllActions();

    this.node.runAction(
      cc.sequence(
        cc.moveBy(0.02, cc.v2(2.5, 3.5)),
        cc.moveBy(0.02, cc.v2(-3, 3.5)),
        cc.moveBy(0.02, cc.v2(-6.5, 1.5)),
        cc.moveBy(0.02, cc.v2(1.5, -3)),
        cc.moveBy(0.02, cc.v2(-2.5, 2.5)),
        cc.moveBy(0.02, cc.v2(1, -4)),
        cc.moveBy(0.02, cc.v2(-4, -5)),
        cc.moveBy(0.02, cc.v2(1.5, 5)),
        cc.callFunc(() => {
          console.log("震动回调");
          this.node.setPosition(pos);
        }, this)
      )
    );
  }

  clickHandle() {
    this.node.dispatchEvent(new cc.Event.EventCustom("attack", true));
  }

  cardDestory() {
    console.log("卡片销毁了");
    cc.tween(this.node).to(0.5, { opacity: 0 }).start();
  }

  cardHurt(needDisappear = true) {
    console.log("卡片受伤害了");
    this.hurtMask.opacity = 255;
    // cc.tween(this.hurtMask).to(0.3, { opacity: 255 }).start();
    cc.tween(this.hurtBling)
      .to(0.7, { opacity: 255, scale: 1 }, { easing: "elasticOut" })
      .call(() => {
        needDisappear && this.cardDestory();
      })
      .start();
  }
}
