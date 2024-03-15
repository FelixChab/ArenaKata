import { ArenaDamageCalculator } from './arena-damage-calculator';
import { HeroElement } from './model/hero-element';
import { Hero } from './model/hero';
import { Buff } from './model/buff';

describe("Arena damage calculator", function() {
  let calculator: ArenaDamageCalculator;
  let fireAttacker: Hero;
  let waterDefender: Hero;
  let defenders: Hero[];

  beforeEach(() => { 
    // Initialize the calculator
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
        }else if(attackerElement === defenderElement){
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