import EffectId from '../../../resources/effect_id';
import { JobDetail } from '../../../types/event';
import { kAbility } from '../constants';
import { Bars } from '../jobs';
import { computeBackgroundColorFrom } from '../utils';

let resetFunc: (bars: Bars) => void;

export const setup = (bars: Bars): void => {
  let tid1 = 0;

  const ninki = bars.addResourceBox({
    classList: ['nin-color-ninki'],
  });
  const hutonBox = bars.addProcBox({
    id: 'nin-procs-huton',
    fgColor: 'nin-color-huton',
    threshold: 20,
  });
  const trickAttack = bars.addProcBox({
    id: 'nin-procs-trickattack',
    fgColor: 'nin-color-trickattack',
  });
  const bunshin = bars.addProcBox({
    id: 'nin-procs-bunshin',
    fgColor: 'nin-color-bunshin',
  });
  bars.onUseAbility(kAbility.Bunshin, () => {
    bunshin.duration = 90;
  });
  const ninjutsu = bars.addProcBox({
    id: 'nin-procs-ninjutsu',
    fgColor: 'nin-color-ninjutsu',
  });

  let mudraTriggerCd = true;
  // Ninjutsu's cooldown begins to countdown at the first mudra.
  bars.onYouGainEffect(EffectId.Mudra, () => {
    if (!mudraTriggerCd)
      return;

    if (typeof ninjutsu.duration === 'number') {
      const old = ninjutsu.duration - ninjutsu.elapsed;
      if (old > 0)
        ninjutsu.duration = old + 20;
      else
        ninjutsu.duration = 20 - 0.5;
    }
    mudraTriggerCd = false;
  });
  // On each mudra, Mudra effect will be gain once,
  // use mudraTriggerCd to tell that whether bars mudra trigger cooldown.
  bars.onYouLoseEffect(EffectId.Mudra, () => mudraTriggerCd = true);
  bars.onYouGainEffect(EffectId.Kassatsu, () => mudraTriggerCd = false);
  bars.onYouLoseEffect(EffectId.Kassatsu, () => mudraTriggerCd = true);
  bars.onUseAbility(kAbility.Hide, () => ninjutsu.duration = 0);
  bars.onUseAbility(kAbility.TrickAttack, () => {
    trickAttack.duration = 15;
    trickAttack.threshold = 1000;
    trickAttack.fg = computeBackgroundColorFrom(trickAttack, 'nin-color-trickattack.active');
    tid1 = window.setTimeout(() => {
      trickAttack.duration = 45;
      trickAttack.threshold = bars.gcdSkill * 4;
      trickAttack.fg = computeBackgroundColorFrom(trickAttack, 'nin-color-trickattack');
    }, 15000);
  });
  bars.onStatChange('NIN', () => {
    trickAttack.valuescale = bars.gcdSkill;
    bunshin.valuescale = bars.gcdSkill;
    bunshin.threshold = bars.gcdSkill * 8;
    ninjutsu.valuescale = bars.gcdSkill;
    ninjutsu.threshold = bars.gcdSkill * 2;
  });

  bars.onJobDetailUpdate('NIN', (jobDetail: JobDetail['NIN']) => {
    if (jobDetail.hutonMilliseconds > 0) {
      if (!bars.speedBuffs.huton)
        bars.speedBuffs.huton = true;
    } else if (bars.speedBuffs.huton) {
      bars.speedBuffs.huton = false;
    }
    ninki.innerText = jobDetail.ninkiAmount.toString();
    ninki.parentNode.classList.remove('high', 'low');
    if (jobDetail.ninkiAmount < 50)
      ninki.parentNode.classList.add('low');
    else if (jobDetail.ninkiAmount >= 90)
      ninki.parentNode.classList.add('high');
    if (typeof hutonBox.duration === 'number') {
      const oldSeconds = hutonBox.duration - hutonBox.elapsed;
      const seconds = jobDetail.hutonMilliseconds / 1000.0;
      if (!hutonBox.duration || seconds > oldSeconds)
        hutonBox.duration = seconds;
    }
  });
  const comboTimer = bars.addTimerBar({
    id: 'nin-timers-combo',
    fgColor: 'combo-color',
  });
  bars.onCombo((skill) => {
    comboTimer.duration = 0;
    if (bars.combo?.isFinalSkill)
      return;
    if (skill)
      comboTimer.duration = 15;
  });

  resetFunc = (bars: Bars): void => {
    bunshin.duration = 0;
    mudraTriggerCd = true;
    ninjutsu.duration = 0;
    trickAttack.duration = 0;
    trickAttack.threshold = bars.gcdSkill * 4;
    trickAttack.fg = computeBackgroundColorFrom(trickAttack, 'nin-color-trickattack');
    hutonBox.duration = 0;
    comboTimer.duration = 0;
    clearTimeout(tid1);
  };
};

export const reset = (bars: Bars): void => {
  if (resetFunc)
    resetFunc(bars);
};
