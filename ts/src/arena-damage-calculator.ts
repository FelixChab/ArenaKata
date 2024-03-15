import { HeroElement } from "./model/hero-element";
import { Buff } from "./model/buff";
import { Hero } from "./model/hero";

export class ArenaDamageCalculator {

  /**
   * Precondition - fight is not already won (there is still one defender with lp > 0)
   */
  computeDamage(attacker: Hero, defenders: Hero[]): Hero[] {
    const pow = attacker.pow;

    const adv = [];
    const eq = [];
    const dis = [];
    if(attacker.element === HeroElement.Water) {
      for(const h of defenders) {
        if (h.lp <= 0) { continue; }
        if (h.element === HeroElement.Fire) {
          adv.push(h);
        } else if (h.element === HeroElement.Water) {
          eq.push(h);
        } else {
          dis.push(h);
        }
      }
    } else if(attacker.element === HeroElement.Fire) {
      for(const h of defenders) {
        if (h.lp <= 0) { continue; }
        if (h.element === HeroElement.Fire) {
          eq.push(h);
        } else if (h.element === HeroElement.Water) {
          dis.push(h);
        } else {
          adv.push(h);
        }
      } 
    } else {    // Hero is of type water
      for(const h of defenders) {
        if (h.lp <= 0) { continue; }
        if (h.element === HeroElement.Fire) {
          dis.push(h);
        } else if (h.element === HeroElement.Water) {
          adv.push(h);
        } else {
          eq.push(h);
        }
      }
    }

    const attacked = adv.length && adv[Math.floor(Math.random() * adv.length)] || eq.length && eq[Math.floor(Math.random() * eq.length)] || dis[Math.floor(Math.random() * dis.length)];

    const c = Math.random() * 100 < attacker.crtr;
    let dmg = 0;
    if(c) {
      dmg = (attacker.pow + (0.5 + attacker.leth/ 5000) * attacker.pow) * (1-attacked.def/7500)
    } else {
      dmg = attacker.pow * (1-attacked.def/7500);
    }

    // BUFFS
    if(attacker.buffs.includes(Buff.Attack)) {
      if (c) {
        dmg += (attacker.pow * 0.25 + (0.5 + attacker.leth/ 5000) * attacker.pow * 0.25) * (1-attacked.def/7500)
      } else {
        dmg += attacker.pow * 0.25 * (1-attacked.def/7500);
      }
    }

    if(attacked.buffs.includes(Buff.Defense)) {
      dmg = dmg / (1-attacked.def/7500) * (1-attacked.def/7500 - 0.25);
    }

    dmg = Math.max(dmg, 0);
    if (dmg > 0) {
      if(adv.find(h => h === attacked)) {
        dmg = dmg + dmg * 20/100
      } else if (eq.find(h => h===attacked)) {
      } else {
        dmg = dmg - dmg * 20/100
      }

      dmg = Math.floor(dmg);
      if (dmg > 0) {
        attacked.lp = attacked.lp - dmg
        if (attacked.lp < 0) {
          attacked.lp = 0;
        }
      }
    }

    return defenders;
  }
}