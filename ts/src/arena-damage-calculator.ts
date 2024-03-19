import { HeroElement } from "./model/hero-element";
import { Buff } from "./model/buff";
import { Hero } from "./model/hero";

export class ArenaDamageCalculator {

  /**
   * Precondition - fight is not already won (there is still one defender with lp > 0)
   */
  computeDamage(attacker: Hero, defenders: Hero[]): Hero[] {

    const adv = [];
    const eq = [];
    const dis = [];

    // Assign enemy to corresponding category (advantage, equal, disadvantage)
    // TODO : remplacer par un switch (voir Turncoat) --> voir en fonction du readonly
    switch (attacker.element) {
      case HeroElement.Water:
        // ...
        break
      case HeroElement.Fire:
        // ...
        break
      case HeroElement.Earth:
        // ...
        break
    }
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
    } else {
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
    
    // CRITICAL
    const c = Math.random() * 100 < attacker.crtr;
    let dmg = 0;
    if (c) {
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

    // HOLY --> à revérifier
    if (attacker.buffs.includes(Buff.Holy)) {
      const attacked = defenders.find((defender) => defender.lp > 0)
      if (!attacked) return defenders // No defender
      dmg = attacker.pow * 0.8
      attacked.lp -= Math.floor(dmg)
      if (attacked.lp < 0) attacked.lp = 0
      return defenders
    }

    // TURNCOAT
    if (attacker.buffs.includes(Buff.Turncoat)) {
      switch (attacker.element) {
        case HeroElement.Water:
          attacker.element = HeroElement.Earth;
          break;
        case HeroElement.Fire:
          attacker.element = HeroElement.Water;
          break;
        case HeroElement.Earth:
          attacker.element = HeroElement.Fire;
          break;
      }
    }

    // DEFENSE
    if(attacked.buffs.includes(Buff.Defense)) {
      dmg = dmg / (1-attacked.def/7500) * (1-attacked.def/7500 - 0.25);
    }

    // Damage adv/dis/eq assignement
    dmg = Math.max(dmg, 0);
    if (dmg > 0) {
      if(adv.find(h => h === attacked)) {
        dmg = dmg + dmg * 20/100
      } else if (eq.find(h => h === attacked)) {
        dmg = dmg + 0;
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