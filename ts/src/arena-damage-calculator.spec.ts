import { ArenaDamageCalculator } from "./arena-damage-calculator"
import { Hero } from "./model/hero"
import { HeroElement } from "./model/hero-element"

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