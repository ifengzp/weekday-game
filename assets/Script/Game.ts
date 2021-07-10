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

  onLoad() {
    cc.audioEngine.play(this.bgAudio, true, 0.4);
    this.snow.active = true;
    this.blackCurtainMask.active = true;
    this.blackCurtainMask.opacity = 255;

    setTimeout(() => {
      this.introductionScenario();
    }, 1000);

    cc.tween(this.blackCurtainMask)
      .to(2, { opacity: 0 })
      .call(() => {
        this.blackCurtainMask.active = false;
      })
      .start();
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
        avatar.setScale(0.2);
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
      .to(0.13, { opacity: 0 })
      .to(0.13, { opacity: 255 })
      .to(0.13, { opacity: 100 })
      .to(0.13, { opacity: 255 })
      .to(0.13, { opacity: 150 })
      .to(0.13, { opacity: 255 })
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
      })
      .to(1, { opacity: 0 })
      .call(() => {
        this.blackCurtainMask.active = false;
        cc.audioEngine.play(this.heartAudio, true, 0.8);
      })
      .start();
  }

  ending() {
    console.log("结束");
    this.blackCurtainMask.active = true;
    this.blackCurtainMask.opacity = 0;

    cc.audioEngine.stopAll();
    cc.audioEngine.play(this.failAudio, false, 1);

    cc.tween(this.blackCurtainMask)
      .to(1, { opacity: 255 })
      .call(() => {
        this.main.active = false;
      })
      .start();

    setTimeout(() => {
      this.metempsychosisPanel();
      cc.tween(this.blackCurtainMask)
        .to(1, { opacity: 0 })
        .call(() => {
          this.blackCurtainMask.active = false;
          cc.audioEngine.play(this.bgAudio, true, 0.4);
        })
        .start();
    }, 6000);
  }
}
