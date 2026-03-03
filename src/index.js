// chargement des librairies

/***********************************************************************/
/** CONFIGURATION GLOBALE DU JEU ET LANCEMENT 
/***********************************************************************/


// configuration générale du jeu
var config = {
  type: Phaser.AUTO,
  width: 800, // largeur en pixels
  height: 600, // hauteur en pixels
  physics: {
    // définition des parametres physiques
    default: "arcade", // mode arcade : le plus simple : des rectangles pour gérer les collisions. Pas de pentes
    arcade: {
      // parametres du mode arcade
      gravity: {
        y: 300 // gravité verticale : acceleration ddes corps en pixels par seconde
      },
      debug: false // permet de voir les hitbox et les vecteurs d'acceleration quand mis à true
    }
  },
  scene: {
    // une scene est un écran de jeu. Pour fonctionner il lui faut 3 fonctions  : create, preload, update
    preload: preload, // la phase preload est associée à la fonction preload, du meme nom (on aurait pu avoir un autre nom)
    create: create, // la phase create est associée à la fonction create, du meme nom (on aurait pu avoir un autre nom)
    update: update // la phase update est associée à la fonction update, du meme nom (on aurait pu avoir un autre nom)
  }
};

// création et lancement du jeu
new Phaser.Game(config);


/***********************************************************************/
/** FONCTION PRELOAD 
/***********************************************************************/

/** La fonction preload est appelée une et une seule fois,
 * lors du chargement de la scene dans le jeu.
 * On y trouve surtout le chargement des assets (images, son ..)
 */
function preload() {
  this.load.image("img_ciel", "src/assets/sky.png");
  this.load.image("img_plateforme", "src/assets/platform.png");
  this.load.spritesheet("img_perso", "src/assets/dude.png", {
    frameWidth: 32,
    frameHeight: 48
  });
  this.load.image("img_etoile", "src/assets/star.png");
  this.load.image("img_bombe", "src/assets/bomb.png");

  // chargement tuiles de jeu
  this.load.image("Phaser_tuilesdejeu", "src/assets/tuilesJeu.png");

  // chargement de la carte
  this.load.tilemapTiledJSON("carte", "src/assets/map.json");

  this.load.image("bullet", "src/assets/balle.png");
  this.load.image("cible", "src/assets/cible.png");
}

/***********************************************************************/
/** FONCTION CREATE 
/***********************************************************************/

/* La fonction create est appelée lors du lancement de la scene
 * si on relance la scene, elle sera appelée a nouveau
 * on y trouve toutes les instructions permettant de créer la scene
 * placement des peronnages, des sprites, des platesformes, création des animations
 * ainsi que toutes les instructions permettant de planifier des evenements
 */
function create() {
  
  // chargement de la carte
  const carteDuNiveau = this.add.tilemap("carte");

  // chargement du jeu de tuiles
  const tileset = carteDuNiveau.addTilesetImage(
    "tuiles_de_jeu",
    "Phaser_tuilesdejeu"
  );

  // chargement du calque calque_background
  const calque_background = carteDuNiveau.createLayer(
    "calque_background",
    tileset
  );

  // chargement du calque calque_background_2
  const calque_background_2 = carteDuNiveau.createLayer(
    "calque_background_2",
    tileset
  );

  // chargement du calque calque_plateformes
  const calque_plateformes = carteDuNiveau.createLayer(
    "calque_plateformes",
    tileset
  );

  calque_plateformes.setCollisionByProperty({ estSolide: true });

  cibles = this.physics.add.group({
    key: 'cible',
    repeat: 7,
    setXY: { x: 24, y: 0, stepX: 107 }
  });

  player = this.physics.add.sprite(100, 450, 'img_perso');
  player.setCollideWorldBounds(true);
  this.physics.add.collider(player, groupe_plateformes);
  player.setBounce(0.2);
  player.direction = 'right';

  clavier = this.input.keyboard.createCursorKeys();
  boutonFeu = this.input.keyboard.addKey('A');
  groupeBullets = this.physics.add.group();

  cibles.children.iterate(function (cibleTrouvee) {
   // définition de points de vie
   cibleTrouvee.pointsVie=Phaser.Math.Between(1, 5);;
   // modification de la position en y
   cibleTrouvee.y = Phaser.Math.Between(10,250);
   // modification du coefficient de rebond
   cibleTrouvee.setBounce(.8);
}); 

  this.anims.create({

    key: "anim_tourne_gauche",  // key est le nom de l'animation : doit etre unique poru la scene.
    frames: this.anims.generateFrameNumbers("img_perso", { start: 0, end: 3 }), // on prend toutes les frames de img perso numerotées de 0 à 3 
    frameRate: 10,  // vitesse de défilement des frames 
    repeat: -1  // nombre de répétitions de l'animation. -1 = infini 
  });

  this.anims.create({
    key: "anim_tourne_droite",
    frames: this.anims.generateFrameNumbers("img_perso", { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: "anim_face",
    frames: [{ key: "img_perso", frame: 4 }],
    frameRate: 20
  });

  groupe_etoiles = this.physics.add.group();
  for (var i = 0; i < 10; i++) {
    var coordX = 70 + 70 * i;
    groupe_etoiles.create(coordX, 10, "img_etoile");
  }
  this.physics.add.collider(groupe_etoiles, groupe_plateformes);

  groupe_etoiles.children.iterate(function iterateur(etoile_i) {
    var coef_rebond = Phaser.Math.FloatBetween(0.4, 0.8);
    etoile_i.setBounceY(coef_rebond);
  });

  this.physics.add.overlap(player, groupe_etoiles, ramasserEtoile, null, this);

  zone_texte_score = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#fff' });
  zone_texte_score.setScrollFactor(0);

  groupe_bombes = this.physics.add.group();
  this.physics.add.collider(groupe_bombes, groupe_plateformes);

  this.physics.add.collider(player, groupe_bombes, chocAvecBombe, null, this);


  // ajout d'une collision entre le joueur et le calque plateformes
  this.physics.add.collider(player, calque_plateformes);
  // redimentionnement du monde avec les dimensions calculées via tiled
  this.physics.world.setBounds(0, 0, 3200, 640);
  //  ajout du champs de la caméra de taille identique à celle du monde
  this.cameras.main.setBounds(0, 0, 3200, 640);
  // ancrage de la caméra sur le joueur
  this.cameras.main.startFollow(player);

  this.physics.add.collider(cibles, calque_plateformes);
  this.physics.add.overlap(groupeBullets, cibles, hit, null,this);

  this.physics.world.on("worldbounds", function(body) {
        // on récupère l'objet surveillé
        var objet = body.gameObject;
        // s'il s'agit d'une balle
        if (groupeBullets.contains(objet)) {
            // on le détruit
            objet.destroy();
        }
    });

}


/***********************************************************************/
/** FONCTION UPDATE 
/***********************************************************************/

function update() {
  if (clavier.right.isDown) {
    player.direction = 'left';
    player.setVelocityX(160);
    player.anims.play("anim_tourne_droite", true);
  }
  else if (clavier.left.isDown) {
    player.direction = 'right';
    player.setVelocityX(-160);
    player.anims.play("anim_tourne_gauche", true);
  } else {
    player.setVelocityX(0);
    player.anims.play('anim_face');

  }

  if (clavier.space.isDown && player.body.blocked.down) {
    player.setVelocityY(-400);
  }

  if (gameOver) {
    return;
  }

  if (Phaser.Input.Keyboard.JustDown(boutonFeu)) {
    tirer(player);
  }
}

function ramasserEtoile(un_player, une_etoile) {
  une_etoile.disableBody(true, true);
  if (groupe_etoiles.countActive(true) == 0) {
    groupe_etoiles.children.iterate(function iterateur(etoile_i) {
      etoile_i.enableBody(true, etoile_i.x, 0, true, true);
    });
  }
  score += 10;;
  zone_texte_score.setText("Score:" + score);

  var x;
  if (player.x < 400) {
    x = Phaser.Math.Between(400, 800);
  } else {
    x = Phaser.Math.Between(0, 400);
  }

  var une_bombe = groupe_bombes.create(x, 16, "img_bombe");
  une_bombe.setBounce(1);
  une_bombe.setCollideWorldBounds(true);
  une_bombe.setVelocity(Phaser.Math.Between(-200, 200), 20);
  une_bombe.allowGravity = false;
}

function chocAvecBombe(un_player, une_bombe) {
  this.physics.pause();
  player.setTint(0xff0000);
  player.anims.play("anim_face");
  gameOver = true;
}

function tirer(player) {
  var coefDir;
  if (player.direction == 'left') { coefDir = -1; } else { coefDir = 1 }
  // on crée la balle a coté du joueur
  var bullet = groupeBullets.create(player.x + (25 * coefDir), player.y - 4, 'bullet');
  // parametres physiques de la balle.
  bullet.setCollideWorldBounds(true);
   bullet.body.onWorldBounds = true;  
  bullet.body.allowGravity = false;
  bullet.setVelocity(1000 * coefDir, 0); // vitesse en x et en y
}

function hit (uneBalle, uneCible) {
    uneBalle.destroy(); // destruction de la balle
    uneCible.destroy();  // destruction de la cible.   
}  

function hit (bullet, cible) {
  cible.pointsVie--;
  if (cible.pointsVie==0) {
    cible.destroy();
    score += 10;
    zone_texte_score.setText("Score:" + score);
  } 
   bullet.destroy();
}  

var groupe_plateformes;
var player;  // désigne le sprite du joueur 
var clavier;
var groupe_etoiles;
var score = 0;
var zone_texte_score;
var groupe_bombes;
var gameOver = false;
var boutonFeu;
var groupeBullets;
var cibles;  