# Arena kata

Prenez le contrôle de l'arène en infligeant des dégâts massifs à vos adversaires.

## Concept

Notre société, H4XX0R G4m3Rs Inc., est fière de posséder l'un des jeux mobiles
de combat en arène les plus évolués du genre.

Toute notre logique dépend du calculateur de dégâts, qui offre une finesse dans les possibilités
sans pareille.
Ce calculateur a longtemps été le meilleur du marché. Cependant, d'autres concurrents se sont
acharnés à mettre en place des modèles aussi complexes que les nôtres, et nous avons désormais
besoin de le faire évoluer à nouveau pour rester compétitif.

Il y a un petit problème cependant. On a confié le développement de ce moteur à John (un ~~stagiaire~~ développeur
extrêmement compétent), et il est parti avant d'avoir pu transmettre la quintessence de son art à qui que ce
soit. Nos plus grands experts se sont depuis penchés sur ce code, mais ont dû admettre ~~que c'était de la m\*\*\*\*~~
que le code dépassait de loin leur capacité de compréhension.

C'est pour ça que vous êtes là.

## Les règles métiers

Nos experts fonctionnels ne peuvent pas garantir qu'ils maitrisent toute la complexité du système,
mais voilà ce qu'ils en savent :

### Physionomie d'un combat en arène

- Les combats en arène s'effectuent à 3 héros contre 3 héros adverses
- Chaque tour de l'algorithme de dégâts représente l'attaque d'un héros sur l'équipe adverse.
  Un autre morceau de code se charge d'orchestrer les tours de chaque héros, et donc le déroulement
  du combat complet.

### Affinité des héros

- Chaque héros appartient à une des affinités suivante : `Eau`, `Feu`, `Terre`
  - L'`Eau` a un bonus sur le `Feu` (ce qui veut aussi dire que le `Feu` a un malus sur l'`Eau`)
  - Le `Feu` a un bonus sur la `Terre` (donc la `Terre` a un malus sur le `Feu`)
  - La `Terre` a un bonus sur l'`Eau` (donc... enfin vous avez compris)
- Un héros qui attaque un héros contre lequel il a un bonus inflige `+20%` de dégâts supplémentaires
- À l'inverse, un héros attaquant un héros adverse avec un malus inflige `-20%` de dégâts

### Caractéristique des héros

- Chaque héros possède les caractéristiques suivantes :
  - La **Puissance** (`POW`) détermine la quantité de dégâts bruts infligés. `1 POW = 1 point de dégât`
  - La **Défense** (`DEF`) détermine le pourcentage de dégâts absorbés. `75 DEF = 1% de dégât en moins`
  - Le **Taux de critique** (`CRTR`) détermine si une attaque porte un coup critique. C'est une valeur entre 0 et 100
  - La **Létalité** (`LETH`) détermine le surcroit de dégâts critiques. Une attaque critique inflige `50% + (LETH/50)%` de dégâts supplémentaires
  - Les **Points de vie** (`LP`) déterminent la quantité de dégât qu'un héros peut encaisser avant d'être au tapis. Ils ne peuvent pas descendre en dessous de 0.
    Il existe d'autres caractéristiques, mais qui n'impactent pas le déroulement d'un tour de combat.

### Dernière nouveauté : les buffs

Chaque héros peut avoir un ou plusieurs avantages (aka `buffs`) sur lui. Il existe pour l'instant deux types d'avantage :

- `Attack`: si le héros est l'attaquant, il inflige 25% de dégâts supplémentaires
- `Defense`: si le héros est le défenseur, il subit 25% de dégâts en moins

### Physionomie d'un tour de combat

Lorsqu'un héros attaque, le choix de l'adversaire s'effectue aléatoirement, **MAIS**
en prenant en compte les forces et les faiblesses :

- L'attaquant cherchera d'abord à attaquer un héros contre lequel il a un bonus
- S'il n'en trouve pas, il cherchera un adversaire neutre
- S'il n'en trouve pas, il se rabattra sur un adversaire contre lequel il subit un malus.

Le héros ne s'attaquera jamais à un héros déjà vaincu (donc avec `0 LP`)

## De nouvelles fonctionnalités

Les jeux concurrents ont riposté à nos premiers développements du système d'avantage par une avalanche de `buffs` aux caractéristiques diverses et variées. Nous souhaitons proposer une approche différente avec deux avantages **révolutionaires** :

- `HOLY` : un héros avec l'avantage `HOLY` :
  - N'est plus affecté par un avantage ou un désavantage face à ses adversaires (qu'il soit en attaque ou en défense)
  - S'il est l'attaquant, il choisit donc n'importe quel adversaire
  - S'il est l'attaquant, il inflige 20% de dégâts en moins, mais ignore la déf de l'adversaire
- `TURNCOAT` : un héros disposant de l'avantage `TURNCOAT` subit un changement d'élément temporaire, en faveur de l'élément qu'il craint.
  - S'il était `Feu`, il devient `Eau`
  - S'il était `Eau`, il devient `Terre`
  - S'il était `Terre`, il devient `Feu`

## Contraintes

Le code des héros est déjà lourdement utilisé. Vous avez le droit d'ajouter des éléments, mais vous ne pouvez pas **modifier ou supprimer des champs existants**
