import { ArenaDamageCalculator } from './arena-damage-calculator';
import { HeroElement } from './model/hero-element';
import { Hero } from './model/hero';
import { Buff } from './model/buff';

// TESTS ELEMENTS
describe("Arena damage calculator", function() {
  let calculator: ArenaDamageCalculator;

  beforeEach(() => { 
    calculator = new ArenaDamageCalculator();
  });

  it('should calculate damage correctly for an attacker of each type attacking a defender of each type', () => {
    const elements = [HeroElement.Water, HeroElement.Fire, HeroElement.Earth];
    const power = 100; // Attacker Power
    const initialLP = 1000; // Initial hit points of the defender
  
    elements.forEach(attackerElement => {
      elements.forEach(defenderElement => {
        const attacker = new Hero(attackerElement, power, 0, 0, 0, initialLP);
        const defender = new Hero(defenderElement, power, 0, 0, 0, initialLP);
        const defenders = [defender];
  
        calculator.computeDamage(attacker, defenders);
  
        // Calculates expected damage based on element only, without taking defense into account.
        let expectedDamage = power;
        if ((attackerElement === HeroElement.Water && defenderElement === HeroElement.Fire) ||
            (attackerElement === HeroElement.Fire && defenderElement === HeroElement.Earth) ||
            (attackerElement === HeroElement.Earth && defenderElement === HeroElement.Water)) {
          expectedDamage *= 1.2; // +20% for advantage
        } else if ((attackerElement === HeroElement.Water && defenderElement === HeroElement.Earth) ||
                   (attackerElement === HeroElement.Fire && defenderElement === HeroElement.Water) ||
                   (attackerElement === HeroElement.Earth && defenderElement === HeroElement.Fire)) {
          expectedDamage *= 0.8; // -20% for disadvantage
        } else if(attackerElement === defenderElement){
          expectedDamage = power; // No change to damage, it's a neutral
        }
        // Checks if the defender's LP after the attack is as expected.
        //les points de vie restants du défenseur = les points de vie initiaux - les dégâts infligés
        const expectedDefenderLP = Math.max(initialLP - Math.floor(expectedDamage), 0);
  
        expect(defender.lp).toBe(expectedDefenderLP);
      });
    });
  });
});

// TESTS BUFF
describe("Testing behavior when attacker has an attack buff and defender has a defense buff", function () {
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
    const expectedDamage = attacker.pow * 1.25 * 0.75;
  
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
});

// TEST CRITICAL HIT 
describe("Critical chance applies to Attacker damage output", function () {
  // Initialize
  let calculator: ArenaDamageCalculator;
  let attacker: Hero;
  let defender: Hero;
  let defenders: Hero[];

  // PLAN
  beforeEach(() => {
    calculator = new ArenaDamageCalculator();
    attacker = new Hero(HeroElement.Earth, 100, 50, 50, 100, 1000); // 100% Critical chance
    defender = new Hero(HeroElement.Earth, 100, 70, 75, 50, 1000); // Same element, 0% defense
    defenders = [defender];
  })

  // ACT
  it("should apply critical damage according to stats", () => {
    const expectedAttackerDmg = 149 // à vérif
    const initialDefenderLP = defender.lp
    const toBeDefenderLP = initialDefenderLP - expectedAttackerDmg
    calculator.computeDamage(attacker, defenders)

    // ASSERT
    expect(defender.lp).toBe(toBeDefenderLP)
  })
});

// TEST LIFE POINTS >= 0
describe("Hero life points shouldn't be negative", function () {
  // Initialize
  let calculator: ArenaDamageCalculator;
  let attacker: Hero;
  let defender: Hero;
  let defenders: Hero[];

  // PLAN
  beforeEach(() => { 
    calculator = new ArenaDamageCalculator();
    attacker = new Hero(HeroElement.Water, 100, 50, 100, 100, 1000); // DMG = 182.4
    defender = new Hero(HeroElement.Fire, 100, 0, 0, 0, 150); // Expected LP = -32.4
    defenders = [defender];
  });

  // ACT
  it("should return a dead hero (0 LP)", () => {
    calculator.computeDamage(attacker, defenders);

    // ASSERT
    expect(defender.lp).toBe(0); // No negative defender's LP
   });
 });