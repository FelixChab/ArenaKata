import { HeroElement } from "./model/hero-element";
import { Buff } from "./model/buff";
import { Hero } from "./model/hero";

export class ArenaDamageCalculator {

  public CriticalRateDivisor = 5000;
  public DefenseRateDivisor = 7500;
  public AttackBuffMultiplier = 0.25;
  public HolyBuffMultiplier = 0.8;
  public DefenseBuffMultiplier = 0.25;
  public AdvantageDamageMultiplier = 0.2;
  public DisadvantageDamageMultiplier = 0.2;

  /**
   * Precondition - fight is not already won (there is still one defender with lp > 0)
   */
  computeDamage(attacker: Hero, defenders: Hero[]): Hero[] {
    const adv = [];
    const eq = [];
    const dis = [];

    // Assign enemy to corresponding category (advantage, equal, disadvantage)
    for (const h of defenders) {
      // cf. Preconditioh
      if (h.lp <= 0) { continue; }
      switch(attacker.element) {
        case HeroElement.Water:
          h.element === HeroElement.Fire ? adv.push(h) : h.element === HeroElement.Water ? eq.push(h) : dis.push(h);
          break;
        case HeroElement.Fire:
          h.element === HeroElement.Fire ? eq.push(h) : h.element === HeroElement.Water ? dis.push(h) : adv.push(h);
          break;
        case HeroElement.Earth:
          h.element === HeroElement.Fire ? dis.push(h) : h.element === HeroElement.Water ? adv.push(h) : eq.push(h);
          break;
      }
    }

    const attacked = adv.length && adv[Math.floor(Math.random() * adv.length)] || eq.length && eq[Math.floor(Math.random() * eq.length)] || dis[Math.floor(Math.random() * dis.length)];
    
    // CRITICAL
    const c = Math.random() * 100 < attacker.crtr;
    let dmg = 0;
    if (c) {
      dmg = (attacker.pow + (0.5 + attacker.leth/ this.CriticalRateDivisor) * attacker.pow) * (1-attacked.def/this.DefenseRateDivisor)
    } else {
      dmg = attacker.pow * (1-attacked.def/this.DefenseRateDivisor);
    }
    
    // BUFFS
    if(attacker.buffs.includes(Buff.Attack)) {
      if (c) {
        dmg += (attacker.pow * this.AttackBuffMultiplier + (0.5 + attacker.leth / this.CriticalRateDivisor) * attacker.pow * this.AttackBuffMultiplier) * (1-attacked.def/this.DefenseRateDivisor)
      } else {
        dmg += attacker.pow * this.AttackBuffMultiplier * (1 - attacked.def / this.DefenseRateDivisor);
      }
    }

    // HOLY 
    if (attacker.buffs.includes(Buff.Holy)) {
      if (c) {
        dmg += attacker.pow * this.HolyBuffMultiplier + (0.5 + attacker.leth / this.CriticalRateDivisor);
      } else {
        dmg = attacker.pow * this.HolyBuffMultiplier; // Holy ignores defense
      }
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
      dmg = dmg / (1-attacked.def/this.DefenseRateDivisor) * (1-attacked.def/this.DefenseRateDivisor - this.DefenseBuffMultiplier);
    }

    // Damage adv/dis/eq assignement
    dmg = Math.max(dmg, 0);
    if (dmg > 0) {
      if(adv.find(h => h === attacked)) {
        dmg = dmg + dmg * this.AdvantageDamageMultiplier
      } else if (eq.find(h => h === attacked)) {
        dmg = dmg + 0;
      } else {
        dmg = dmg - dmg * this.DisadvantageDamageMultiplier
      }
      // Attacking defender
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