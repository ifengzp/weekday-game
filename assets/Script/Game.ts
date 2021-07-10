import { sleep } from "./Utils";
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

  private playCount: number = 0;

  onLoad() {
    this.earphone.active = true;
    // // TODO: 删除
    // this.test();
    this.node.on("gameWin", this.gameOver.bind(this, true));
    this.node.on("gameFail", this.gameOver.bind(this, false));
  }

  gameOver(success) {
    // TODO: 区分胜利和失败
    console.log(success ? "游戏胜利" : "游戏失败");
    this.ending();
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
              .by(1.5, { scale: 0.6 })
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

  async ending() {
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

    await sleep(6000);
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
