import { JobDetail } from '../../../types/event';
import { kAbility } from '../constants';
import { Bars } from '../jobs';

let resetFunc: (bars: Bars) => void;

export const setup = (bars: Bars): void => {
  const aetherflowStackBox = bars.addResourceBox({
    classList: ['sch-color-aetherflow'],
  });

  const fairyGaugeBox = bars.addResourceBox({
    classList: ['sch-color-fairygauge'],
  });

  const bioBox = bars.addProcBox({
    id: 'sch-procs-bio',
    fgColor: 'sch-color-bio',
    notifyWhenExpired: true,
  });

  const aetherflowBox = bars.addProcBox({
    id: 'sch-procs-aetherflow',
    fgColor: 'sch-color-aetherflow',
  });

  const lucidBox = bars.addProcBox({
    id: 'sch-procs-luciddreaming',
    fgColor: 'sch-color-lucid',
  });

  bars.onJobDetailUpdate('SCH', (jobDetail: JobDetail['SCH']) => {
    const aetherflow = jobDetail.aetherflowStacks;
    const fairygauge = jobDetail.fairyGauge;
    const milli = Math.ceil(jobDetail.fairyMilliseconds / 1000);
    aetherflowStackBox.innerText = aetherflow.toString();
    fairyGaugeBox.innerText = fairygauge.toString();
    const f = fairyGaugeBox.parentNode;
    if (jobDetail.fairyMilliseconds !== 0) {
      f.classList.add('bright');
      fairyGaugeBox.innerText = milli.toString();
    } else {
      f.classList.remove('bright');
      fairyGaugeBox.innerText = fairygauge.toString();
    }

    // dynamically annouce user depends on their aetherflow stacks right now
    aetherflowBox.threshold = bars.gcdSpell * (aetherflow || 1) + 1;

    const p = aetherflowStackBox.parentNode;
    const s = aetherflowBox.duration ?? 0 - aetherflowBox.elapsed;
    if (aetherflow * 5 >= s) {
      // turn red when stacks are too much before AF ready
      p.classList.add('too-much-stacks');
    } else {
      p.classList.remove('too-much-stacks');
    }
  });

  bars.onUseAbility([
    kAbility.Bio,
    kAbility.Bio2,
    kAbility.Biolysis,
  ], () => {
    bioBox.duration = 30;
  });

  bars.onUseAbility(kAbility.Aetherflow, () => {
    aetherflowBox.duration = 60;
    aetherflowStackBox.parentNode.classList.remove('too-much-stacks');
  });
  bars.onUseAbility(kAbility.LucidDreaming, () => {
    lucidBox.duration = 60;
  });

  bars.onStatChange('SCH', () => {
    bioBox.valuescale = bars.gcdSpell;
    bioBox.threshold = bars.gcdSpell + 1;
    aetherflowBox.valuescale = bars.gcdSpell;
    lucidBox.valuescale = bars.gcdSpell;
    lucidBox.threshold = bars.gcdSpell + 1;
  });

  resetFunc = (_bars: Bars): void => {
    bioBox.duration = 0;
    aetherflowBox.duration = 0;
    lucidBox.duration = 0;
  };
};

export const reset = (bars: Bars): void => {
  if (resetFunc)
    resetFunc(bars);
};
