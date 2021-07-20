import { random, sleep } from "./Utils";
import Main from "./Main";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Game extends cc.Component {
  @property({ type: cc.AudioClip }) bgAudio: cc.AudioClip = null;
  @property({ type: cc.AudioClip }) heartAudio: cc.AudioClip = null;
  @property({ type: cc.AudioClip }) failAudio: cc.AudioClip = null;

  @property({ type: cc.Node }) introduction: cc.Node = null;
  @property({ type: cc.Node }) startPanel: cc.Node = null;
  @property({ type: cc.Node }) building: cc.Node = null;
  @property({ type: cc.Node }) blackCurtainMask: cc.Node = null;
  @property({ type: cc.Node }) beginTip: cc.Node = null;
  @property({ type: cc.Node }) beginBtn: cc.Node = null;
  @property({ type: cc.Node }) snow: cc.Node = null;
  @property({ type: cc.Node }) main: cc.Node = null;
  @property({ type: cc.Node }) earphone: cc.Node = null;

  @property({ type: cc.Node }) endingNode: cc.Node = null;
  @property({ type: cc.Node }) endingSuccess: cc.Node = null;
  @property({ type: cc.Node }) endingFail: cc.Node = null;

  private playCount: number = 0;

  onLoad() {
    this.setWxShare();
    this.earphone.active = true;
    // // TODO: 删除
    // this.test();
    this.node.on("gameWin", this.gameOver.bind(this, true));
    this.node.on("gameFail", this.gameOver.bind(this, false));
  }

  setWxShare() {
    const wx: any = window["wx"];
    if (!wx) return;

    // 设置右上角分享
    wx.showShareMenu({
      withShareTicket: true,
      menus: ["shareAppMessage", "shareTimeline"],
    });
    wx.onShareAppMessage(() => {
      const tips = [
        "又要熬夜加班了",
        "996我受不了了",
        "996 icu",
        "我的悲剧人生",
        "打工人不配夜生活",
        "挣钱养家不容易",
        "体检说我心律不齐",
      ];
      const tipIdx = random(0, tips.length - 1);
      return {
        title: tips[tipIdx],
        imageUrlId: "TwqMpAJwTheGS/68B4XRkQ==",
        imageUrl:
          "https://mmocgame.qpic.cn/wechatgame/dTWXQtTAFkzYbu82F0paBdUicuflqxZf0Qs72cnY4X6dtfPf7bdmN15tAc4T0BHtM/0",
      };
    });
  }

  gameOver(success) {
    // TODO: 区分胜利和失败
    console.log(success ? "游戏胜利" : "游戏失败");
    this.ending(success);
  }

  async openEarphoneCb() {
    cc.audioEngine.play(this.bgAudio, true, 0.4);
    this.snow.active = true;
    this.blackCurtainMask.active = true;
    this.blackCurtainMask.opacity = 0;
    cc.tween(this.blackCurtainMask)
      .to(1, { opacity: 255 })
      .call(() => {
        this.earphone.active = false;
      })
      .start();
    await sleep();
    this.introductionScenario();
    cc.tween(this.blackCurtainMask)
      .to(2, { opacity: 0 })
      .call(() => {
        this.blackCurtainMask.active = false;
      })
      .start();
  }

  test() {
    cc.audioEngine.play(this.bgAudio, true, 0.4);
    cc.audioEngine.play(this.heartAudio, true, 0.4);

    this.main.active = true;
  }

  introductionScenario() {
    const animator = this.introduction.getComponents(cc.Animation)[0];
    this.introduction.active = true;
    animator.on("stop", () => {
      cc.tween(this.introduction)
        .to(1, { opacity: 0 })
        .call(() => {
          this.introduction.active = false;
          this.introductionTransfer();
        })
        .start();
    });
    animator.play();
  }

  introductionTransfer() {
    this.building.setScale(1);
    cc.tween(this.building)
      .to(2.5, { scale: 5 })
      .call(() => {
        const avatar = this.building.getChildByName("avatarIcon");
        avatar.opacity = 0;
        avatar.setScale(0.3);
        cc.tween(avatar)
          .to(1.5, { opacity: 255 })
          .call(() => {
            this.startPanelScenario();
            cc.tween(this.building)
              .by(2.3, { scale: 0.6 })
              .call(() => {})
              .start();
          })
          .start();
      })
      .start();
  }

  startPanelScenario() {
    this.blackCurtainMask.active = true;
    cc.tween(this.blackCurtainMask)
      .delay(0.5)
      .to(2, { opacity: 255 })
      .call(() => {
        this.building.active = false;
        this.snow.active = false;
        this.metempsychosisPanel();

        cc.tween(this.blackCurtainMask)
          .to(1.5, { opacity: 0 })
          .call(() => {
            this.blackCurtainMask.active = false;
          })
          .start();
      })
      .start();
  }

  metempsychosisPanel() {
    this.startPanel.active = true;
    this.startPanel.opacity = 255;
    this.beginTip.active = false;
    this.beginBtn.active = false;
    this.beginBtn.opacity = 0;

    cc.tween(this.startPanel)
      .to(0.14, { opacity: 0 })
      .to(0.14, { opacity: 255 })
      .to(0.14, { opacity: 100 })
      .to(0.14, { opacity: 255 })
      .to(0.14, { opacity: 150 })
      .to(0.14, { opacity: 255 })
      .to(0.14, { opacity: 150 })
      .to(0.14, { opacity: 255 })
      .call(() => {
        const animator = this.beginTip.getComponents(cc.Animation)[0];
        this.beginTip.active = true;
        animator.on("stop", () => {
          this.beginBtn.active = true;
          cc.tween(this.beginBtn).to(1, { opacity: 255 }).start();
        });
        animator.play();
      })
      .start();
  }

  play() {
    this.blackCurtainMask.active = true;
    this.blackCurtainMask.opacity = 0;
    this.beginBtn.active = false;

    cc.tween(this.startPanel).to(1, { opacity: 0 }).start();
    cc.tween(this.blackCurtainMask)
      .to(1, { opacity: 255 })
      .call(() => {
        this.main.active = true;
        this.playCount += 1;
        if (this.playCount > 1) this.main.getComponent(Main).restart();
      })
      .to(1, { opacity: 0 })
      .call(() => {
        this.blackCurtainMask.active = false;
        cc.audioEngine.play(this.heartAudio, true, 0.8);
      })
      .start();
  }

  async ending(success) {
    console.log("结束");
    this.blackCurtainMask.active = true;
    this.blackCurtainMask.opacity = 0;

    cc.audioEngine.stopAll();
    cc.audioEngine.play(this.failAudio, false, 0.4);

    cc.tween(this.blackCurtainMask)
      .to(1, { opacity: 255 })
      .call(() => {
        this.main.active = false;
      })
      .start();

    // 播放动画
    console.log("播放动画");
    this.endingNode.active = true;
    this.endingNode.opacity = 255;
    if (success) {
      this.endingFail.active = false;
      this.endingSuccess.active = true;
      this.endingSuccess.getComponent(cc.Animation).play();
    } else {
      this.endingSuccess.active = false;
      this.endingFail.active = true;
      this.endingFail.getComponent(cc.Animation).play();
    }

    await sleep(7000);
    cc.tween(this.endingNode)
      .to(1, { opacity: 0 })
      .call(() => {
        this.endingNode.opacity = 0;
        this.endingNode.active = false;
        this.endingFail.active = false;
        this.endingSuccess.active = false;
        console.log("播放动画结束");
      })
      .start();

    // 新的一天
    await sleep(2500);
    this.metempsychosisPanel();
    cc.tween(this.blackCurtainMask)
      .to(1, { opacity: 0 })
      .call(() => {
        this.blackCurtainMask.active = false;
        cc.audioEngine.play(this.bgAudio, true, 0.4);
      })
      .start();
  }
}
