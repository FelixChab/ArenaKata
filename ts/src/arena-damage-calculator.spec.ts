import { ArenaDamageCalculator } from './arena-damage-calculator';
import { HeroElement } from './model/hero-element';
import { Hero } from './model/hero';
import { Buff } from './model/buff';

// TESTS ELEMENTS
describe("ARENA TESTS", function() {
  let calculator: ArenaDamageCalculator;
  let attacker: Hero;
  let fireDefender: Hero;
  let waterDefender: Hero;
  let earthDefender: Hero;
  let defeatedDefender: Hero;
  let defenders: Hero[];

  beforeEach(() => { 
    calculator = new ArenaDamageCalculator();

    // Initializing heroes
    attacker = new Hero(HeroElement.Water, 100, 0, 0, 0, 1000); // Attacker with element Water
    fireDefender = new Hero(HeroElement.Fire, 100, 0, 0, 0, 1000); // Fire defender (advantageous target)
    waterDefender = new Hero(HeroElement.Water, 100, 0, 0, 0, 1000); // Water defender (neutral target)
    earthDefender = new Hero(HeroElement.Earth, 100, 0, 0, 0, 1000); // Earth defender (disadvantageous target)
    defeatedDefender = new Hero(HeroElement.Fire, 100, 0, 0, 0, 0); // Defeated defender (0 LP)
    defenders = [fireDefender, waterDefender, earthDefender, defeatedDefender]; // Including the defeated defender in the list
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
        const expectedDefenderLP = Math.max(initialLP - Math.floor(expectedDamage), 0);
  
        expect(defender.lp).toBe(expectedDefenderLP);
      });
    });
  });

  it("should prioritize target with elemental advantage, then neutral, and lastly disadvantage, excluding defeated defenders", () => {
    // Simulate an attack
    const resultDefenders = calculator.computeDamage(attacker, defenders);

    // Expect the fire defender to be targeted first due to elemental advantage
    expect(fireDefender.lp).toBeLessThan(1000);

    // Ensure the water and earth defenders have not been targeted in this attack
    expect(waterDefender.lp).toBe(1000);
    expect(earthDefender.lp).toBe(1000);

    // Ensure the defeated defender's LP remains at 0 and is not targeted
    expect(defeatedDefender.lp).toBe(0);
  });

});

// TESTS ATTRIBUTS HEROS
describe("HEROES ATTRIBUTES TESTS", function() {
  let hero: Hero;
  let calculator: ArenaDamageCalculator;
  let attacker: Hero;
  let defender: Hero;
  let defenders: Hero[];

  beforeEach(() => {
    hero = new Hero(HeroElement.Water, 100, 50, 50, 70, 1000);
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

  it("should correctly update hero's attributes", () => {
    // Update hero's attributes
    hero.pow = 150;
    hero.def = 70;
    hero.leth = 1500;
    hero.crtr = 90;
    hero.lp = 800;

    // Verify if hero's attributes are updated correctly
    expect(hero.pow).toBe(150);
    expect(hero.def).toBe(70);
    expect(hero.leth).toBe(1500);
    expect(hero.crtr).toBe(90);
    expect(hero.lp).toBe(800);
  });

  it('should switch element correctly', () => {
    hero.switchElement(HeroElement.Water);

    expect(hero.element).toBe(HeroElement.Water);
  });

  it("should handle extreme values for hero attributes", () => {
    // Test with very large or very small attribute values
    const hero = new Hero(HeroElement.Water, 9999, 9999, 9999, 9999, 9999);

    expect(hero).toBeDefined();
  });
});

// TESTS BUFFS
describe("ATK/DEF BUFFS TESTS", function () {
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
    const expectedDamage = (attacker.pow * 1.25) * 0.75;
  
    expect(defender.lp).toBeLessThanOrEqual(initialDefenderLP - expectedDamage);
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

// TESTS CRITICAL HIT 
describe("CRITICAL HITS TESTS", function () {
  // Initialize
  let calculator: ArenaDamageCalculator;
  let attacker1: Hero;
  let attacker2: Hero;
  let defender: Hero;
  let defenders: Hero[];

  // PLAN
  beforeEach(() => {
    calculator = new ArenaDamageCalculator()
    attacker1 = new Hero(HeroElement.Earth, 100, 50, 50, 100, 1000) // 100% Critical chance
    attacker2 = new Hero(HeroElement.Earth, 100, 50, 50, 0, 1000) // 0% Critical chance
    defender = new Hero(HeroElement.Earth, 100, 70, 75, 50, 1000) // Same element, 0% defense
    defenders = [defender]
  });

  it("should apply critical damage", () => { 
    const expectedAttackerDmg = Math.floor((attacker1.pow + (0.5 + attacker1.leth/5000) * attacker1.pow) * (1-defender.def/7500));
    const initialDefenderLP = defender.lp;
    const expectedDefenderLP = initialDefenderLP - expectedAttackerDmg;
    calculator.computeDamage(attacker1, defenders);
    
    // ASSERT
    expect(defender.lp).toBe(expectedDefenderLP);
  });

  it("should not apply critical damage", () => { 
    const expectedAttackerDmg = Math.floor(attacker2.pow * (1-defender.def/7500));
    const initialDefenderLP = defender.lp;
    const expectedDefenderLP = initialDefenderLP - expectedAttackerDmg;
    calculator.computeDamage(attacker2, defenders);

    // ASSERT
    expect(defender.lp).toBe(expectedDefenderLP);
  });
});

// TESTS BUFFS HOLY & TURNCOAT
describe("NEW BUFFS TESTS", function() {
  let calculator: ArenaDamageCalculator;
  let holyAttacker: Hero;
  let turncoatAttacker: Hero;
  let earthDefender: Hero;
  let defenders: Hero[];
  let attacker: Hero;
  let defender: Hero;

  beforeEach(() => {
    calculator = new ArenaDamageCalculator();

    holyAttacker = new Hero(HeroElement.Water, 100, 50, 50, 0, 1000);
    holyAttacker.buffs.push(Buff.Holy); // HOLY buff

    turncoatAttacker = new Hero(HeroElement.Fire, 100, 50, 50, 70, 1000);
    turncoatAttacker.buffs.push(Buff.Turncoat); // TURNCOAT buff

    earthDefender = new Hero(HeroElement.Earth, 100, 50, 50, 70, 1000); // Earth defender

    attacker = new Hero(HeroElement.Water, 100, 50, 50, 70, 1000); // Initialize attacker
    defender = new Hero(HeroElement.Fire, 100, 50, 50, 70, 1000); // Initialize defender
    defenders = [defender]; // Initialize defenders array
  });

  it('TURNCOAT buff should correctly change attacker\'s element and calculate damage accordingly', () => {
    const initialEarthDefenderLP = earthDefender.lp;
    
    calculator.computeDamage(turncoatAttacker, [earthDefender]);
    const actualDamage = initialEarthDefenderLP - earthDefender.lp;

    expect(actualDamage).toBeGreaterThan(0);

    if (turncoatAttacker.element === HeroElement.Water) {
        expect(actualDamage).toBeGreaterThan(0); 
    } else {
        expect(actualDamage).toBeLessThan(0); 
    }
  });

  it("should apply both TURNCOAT and Attack buffs correctly on the attacker", () => {
    // Initialize attacker with TURNCOAT and Attack buffs
    attacker = new Hero(HeroElement.Water, 100, 0, 0, 0, 1000);
    attacker.buffs.push(Buff.Turncoat);
    attacker.buffs.push(Buff.Attack);

   // Initialize a Fire defender to ensure elemental advantage after TURNCOAT effect
    defender = new Hero(HeroElement.Fire, 100, 0, 0, 0, 1000);
    defenders = [defender];

    const initialDefenderLP = defender.lp;

    calculator.computeDamage(attacker, defenders);

    // Expecting +20% damage due to elemental advantage (TURNCOAT) and then +25% due to Attack buff
    const expectedDamage = Math.floor((100 * 1.2) * 1.25);
    const expectedDefenderLP = Math.max(initialDefenderLP - expectedDamage, 0);

   expect(defender.lp).toBe(expectedDefenderLP);
  });

  it('should increase damage with AdvantageDamageMultiplier when attacker has elemental advantage', () => {
    // Initialize the attacker with enough power to deal damage
    attacker = new Hero(HeroElement.Water, 100, 0, 0, 0, 1000);
  
    // Initialize the defender with enough lp to survive the attack and an element that is at a disadvantage against the attacker
    defender = new Hero(HeroElement.Fire, 100, 50, 50, 70, 1000);
    defenders = [defender];
  
    const initialDefenderLP = defender.lp;
  
    // Execute damage calculation
    calculator.computeDamage(attacker, defenders);
  
    // The defender's lp should be reduced by the damage amount
    expect(defender.lp).toBeLessThan(initialDefenderLP);
  });

  it('should decrease damage with DisadvantageDamageMultiplier when attacker has elemental disadvantage', () => {
    // Initialize the attacker with enough power to deal damage
    attacker = new Hero(HeroElement.Fire, 100, 0, 0, 0, 1000);
  
    // Initialize the defender with enough lp to survive the attack and an element that is at an advantage against the attacker
    defender = new Hero(HeroElement.Water, 100, 50, 50, 70, 1000);
    defenders = [defender];
  
    const initialDefenderLP = defender.lp;
  
    // Execute damage calculation
    calculator.computeDamage(attacker, defenders);
  
    // The defender's lp should be reduced by the damage amount
    expect(defender.lp).toBeLessThan(initialDefenderLP);
  });

  it('should correctly apply Holy buff', () => {
    attacker.buffs = [Buff.Holy];
    attacker.pow = 10;
    attacker.leth = 5;
    attacker.crtr = 101; // Ensure that the `if (c)` condition is always true
    calculator.CriticalRateDivisor = 5000;
    calculator.HolyBuffMultiplier = 0.8;
  
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toBeDefined();
  });

  // Test for Defense Buff
  it('should correctly apply Defense buff', () => {
    defenders[0].buffs = [Buff.Defense];
    defenders[0].def = 5;
    calculator.DefenseRateDivisor = 7500;
    calculator.DefenseBuffMultiplier = 0.25;
  
    attacker.pow = 10; // Ensure that the damage is greater than 0
  
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toBeDefined();
  });

  it('HOLY buff should nullify advantages and disadvantages, and reduce attacker\'s damage by 20%', () => {
    defender.element = HeroElement.Water;
    const initialDefenderLP = defender.lp;
    const expectedDamage = holyAttacker.pow * 0.8; // Damage reduced by 20%

    calculator.computeDamage(holyAttacker, defenders);

    const actualDamage = initialDefenderLP - defender.lp;

    expect(actualDamage).toBe(expectedDamage);
  });

  it("should confirm that HOLY buff nullifies the effect of Defense buff on the defender", () => {
    // Initialize the attacker with Holy buff
    attacker = new Hero(HeroElement.Water, 100, 0, 50, 70, 1000);
    attacker.buffs.push(Buff.Holy);
  
    // Initialize the defender with Defense buff
    defender = new Hero(HeroElement.Water, 100, 0, 50, 70, 1000);
    defender.buffs.push(Buff.Defense);
    defenders = [defender];
  
    // HOLY buff ignores Defense buff, dealing 80% of attacker's power in damage
    const initialDefenderLP = 1000;
    const expectedDamage = attacker.pow * 0.8; // Damage reduced by 20%
    const expectedDefenderLP = initialDefenderLP - expectedDamage;
    
    // Execute damage calculation
    calculator.computeDamage(attacker, defenders);
  
    expect(defender.lp).toBe(expectedDefenderLP);
  });
  
  it('should change the attacker element to Fire when the attacker has the Turncoat buff and its element is Earth', () => {
    const attacker = new Hero(HeroElement.Earth, 100, 50, 50, 70, 1000);
    attacker.buffs.push(Buff.Turncoat);
    const defender = new Hero(HeroElement.Fire, 100, 50, 50, 70, 1000);
    const defenders = [defender];
  
    calculator.computeDamage(attacker, defenders);
  
    expect(attacker.element).toEqual(HeroElement.Fire);
  });
});












