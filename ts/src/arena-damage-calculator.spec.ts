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

// TESTS BUFFS
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

  it('should calculate damage correctly when attacker has Attack buff and c is false', () => {
    attacker.buffs = [Buff.Attack];
    attacker.pow = 10;
    calculator.AttackBuffMultiplier = 2;
    defender.def = 5;
    calculator.DefenseRateDivisor = 10;
  
    const runs = 100;
    for(let i = 0; i < runs; i++) {
      const initialDefenderLP = defender.lp;
  
      calculator.computeDamage(attacker, defenders);
  
      const actualDmg = initialDefenderLP - defender.lp;
      const expectedDmg = attacker.pow * calculator.AttackBuffMultiplier * (1 - defender.def / calculator.DefenseRateDivisor);
      expect(actualDmg).toBeGreaterThanOrEqual(expectedDmg * 0.9);
      expect(actualDmg).toBeLessThanOrEqual(expectedDmg * 1.1);
  
      // Reset defender's lp for the next run
      defender.lp = initialDefenderLP;
    }
  });

});

// TEST CRITICAL HIT 
describe("Critical chance applies to Hero's damage properly", function () {
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


  it("should not apply critical damage", () => { 
    const expectedAttackerDmg = Math.floor(attacker2.pow * (1-defender.def/7500));
    const initialDefenderLP = defender.lp;
    const expectedDefenderLP = initialDefenderLP - expectedAttackerDmg;
    calculator.computeDamage(attacker2, defenders);

    // ASSERT
    expect(defender.lp).toBe(expectedDefenderLP);
  });
});

// TEST LP >= 0
describe("Life points do not go below zero", function () {
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

// TEST BUFFS HOLY & TURNCOAT
describe("Testing specific buff behaviors: HOLY and TURNCOAT", function() {
  let calculator: ArenaDamageCalculator;
  let holyAttacker: Hero;
  let turncoatAttacker: Hero;
  let fireDefender: Hero;
  let waterDefender: Hero;
  let earthDefender: Hero;
  let defenders: Hero[];

  beforeEach(() => {
    calculator = new ArenaDamageCalculator();

    // Initialisation des héros
    holyAttacker = new Hero(HeroElement.Water, 100, 50, 50, 70, 1000);
    holyAttacker.buffs.push(Buff.Holy); // HOLY buff

    turncoatAttacker = new Hero(HeroElement.Fire, 100, 50, 50, 70, 1000);
    turncoatAttacker.buffs.push(Buff.Turncoat); // TURNCOAT buff

    fireDefender = new Hero(HeroElement.Fire, 100, 50, 50, 70, 1000); // Fire defender
    waterDefender = new Hero(HeroElement.Water, 100, 50, 50, 70, 1000); // Water defender
    earthDefender = new Hero(HeroElement.Earth, 100, 50, 50, 70, 1000); // Earth defender

    defenders = [fireDefender, waterDefender, earthDefender];
  });

  it('TURNCOAT buff should correctly change attacker\'s element and calculate damage accordingly', () => {
    const initialEarthDefenderLP = earthDefender.lp;
    
    // Simuler l'attaque
    calculator.computeDamage(turncoatAttacker, [earthDefender]);
    const actualDamage = initialEarthDefenderLP - earthDefender.lp;


    expect(actualDamage).toBeGreaterThan(0);

    if (turncoatAttacker.element === HeroElement.Water) {
        expect(actualDamage).toBeGreaterThan(0); 
    } else {
        expect(actualDamage).toBeLessThan(0); 
    }
});

it('HOLY buff should nullify advantages and disadvantages, and reduce attacker\'s damage by 20%', () => {
  const initialDefenderLP = defenders[0].lp;
  const initialAttackerPow = holyAttacker.pow;

  calculator.computeDamage(holyAttacker, defenders);
  const actualDamage = initialDefenderLP - defenders[0].lp;

  // Vérifie que les dégâts infligés sont réduits de 20% comme prévu
  const expectedDamage = initialAttackerPow * 0.8; // Réduit les dégâts de 20%
  expect(actualDamage).toBeCloseTo(expectedDamage, 0);
});

});



describe("Testing complex buff interactions", function() {
  let calculator: ArenaDamageCalculator;
  let attacker: Hero;
  let defender: Hero;
  let defenders: Hero[];

  beforeEach(() => {
    calculator = new ArenaDamageCalculator();
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

    // Execute damage calculation
    calculator.computeDamage(attacker, defenders);

    // Expecting +20% damage due to elemental advantage (TURNCOAT) and then +25% due to Attack buff
    const expectedDamage = Math.floor((100 * 1.2) * 1.25);
    const expectedDefenderLP = Math.max(initialDefenderLP - expectedDamage, 0);

    expect(defender.lp).toBe(expectedDefenderLP);
  });

  it("should confirm that HOLY buff nullifies the effect of Defense buff on the defender", () => {
    // Initialize the attacker with HOLY buff
    attacker = new Hero(HeroElement.Earth, 100, 0, 0, 0, 1000);
    attacker.buffs.push(Buff.Holy);

    // Initialize the defender with Defense buff
    defender = new Hero(HeroElement.Water, 100, 50, 50, 70, 1000);
    defender.buffs.push(Buff.Defense);
    defenders = [defender];

    const initialDefenderLP = defender.lp;

    // Execute damage calculation
    calculator.computeDamage(attacker, defenders);

    // HOLY buff ignores Defense buff, dealing 80% of attacker's power in damage
    const expectedDamage = Math.floor(100 * 0.8);
    const expectedDefenderLP = Math.max(initialDefenderLP - expectedDamage, 0);

    expect(defender.lp).toBe(expectedDefenderLP);
  });
});

describe("Target selection based on elemental affinities", function() {
  let calculator: ArenaDamageCalculator;
  let attacker: Hero;
  let fireDefender: Hero;
  let waterDefender: Hero;
  let earthDefender: Hero;
  let defeatedDefender: Hero;
  let defenders: Hero[];

  beforeEach(() => {
    calculator = new ArenaDamageCalculator();

    // Initialize heroes
    attacker = new Hero(HeroElement.Water, 100, 0, 0, 0, 1000); // Attacker with element Water

    fireDefender = new Hero(HeroElement.Fire, 100, 0, 0, 0, 1000); // Fire defender (advantageous target)
    waterDefender = new Hero(HeroElement.Water, 100, 0, 0, 0, 1000); // Water defender (neutral target)
    earthDefender = new Hero(HeroElement.Earth, 100, 0, 0, 0, 1000); // Earth defender (disadvantageous target)
    defeatedDefender = new Hero(HeroElement.Fire, 100, 0, 0, 0, 0); // Defeated defender (0 LP)
    
    defenders = [fireDefender, waterDefender, earthDefender, defeatedDefender]; // Including the defeated defender in the list
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

// TESTS ATTRIBUTS DES HÉROS
describe("Testing hero attributes", function() {
  let hero: Hero;
  let calculator: ArenaDamageCalculator;

  beforeEach(() => {
    hero = new Hero(HeroElement.Water, 100, 50, 50, 70, 1000);
    calculator = new ArenaDamageCalculator();
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

it("should handle zero or negative hero hit points", () => {
    // Test when hero hit points become zero or negative
    const attacker = new Hero(HeroElement.Water, 100, 50, 50, 70, 100);
    const defender = new Hero(HeroElement.Fire, 100, 50, 50, 70, 0);
    const defenders = [defender];
    calculator.computeDamage(attacker, defenders);
    expect(defender.lp).toBe(0);
});
});











