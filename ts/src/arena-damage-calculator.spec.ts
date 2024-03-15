import { ArenaDamageCalculator } from './arena-damage-calculator';
import { Hero } from './model/hero';
import { HeroElement } from './model/hero-element';
import { Buff } from './model/buff';


describe("Testing behavior when attacker has an attack buff and defender has a defense buff", function() {
  let calculator: ArenaDamageCalculator;
  let attacker: Hero;
  let defender: Hero;
  let defenders: Hero[];
  
  beforeEach(() => { 
    // Initialize the calculator
    calculator = new ArenaDamageCalculator();

    // Initialize the attacker and defender with different elements for coverage
    attacker = new Hero(HeroElement.Earth, 100, 50, 50, 70, 1000);
    defender = new Hero(HeroElement.Water, 100, 50, 50, 70, 1000);

    defenders = [defender];
  });

  it('should calculate damage correctly for attacker and defender with simple values', () => {
    const initialDefenderLP = defender.lp;

    calculator.computeDamage(attacker, defenders);

    expect(defender.lp).toBeLessThan(initialDefenderLP); // Damage should reduce defender's LP
  });

  it('should adjust damage correctly when attacker has attack buff and defender has defense buff', () => {
    // Attacker gets an attack buff
    attacker.buffs.push(Buff.Attack);
    // Defender gets a defense buff
    defender.buffs.push(Buff.Defense);
  
    const initialDefenderLP = defender.lp;
    calculator.computeDamage(attacker, defenders);

    // Calculating expected damage considering buffs
    let expectedDamage = attacker.pow * 1.25 * 0.75;
  
    expect(defender.lp).toBeLessThan(initialDefenderLP - expectedDamage);
  });

  it('should adjust damage correctly when attacker has a certain critical hit chance', () => {

    attacker = new Hero(HeroElement.Earth, 100, 50, 50, 100, 1000);
  
    const initialDefenderLP = defender.lp;
  
    calculator.computeDamage(attacker, defenders);
  
    let expectedDamage = ((attacker.pow + (0.5 + attacker.leth / 5000) * attacker.pow) * (1 - defender.def / 7500));
  
    if (attacker.buffs.includes(Buff.Attack)) {
      expectedDamage *= 1.25;
    }
    if (defender.buffs.includes(Buff.Defense)) {
      expectedDamage *= 0.75;
    }

    expect(defender.lp).toBeLessThan(initialDefenderLP - expectedDamage);

});
