export default class niveau2 extends Phaser.Scene {
  // constructeur de la classe
  constructor() {
    super({
      key: "niveau2" //  ici on précise le nom de la classe en tant qu'identifiant
    });
    this.score = 0;
    this.gameOver = false;
  }
  preload() {
    this.load.image('forest_back', 'src/assets/forest_back.png');
    this.load.image('forest_long', 'src/assets/forest_long.png');
    this.load.image('forest_mid', 'src/assets/forest_mid.png');
    this.load.image('forest_mountain', 'src/assets/forest_mountain.png');
    this.load.image('forest_short', 'src/assets/forest_short.png');
    this.load.image('forest_sky', 'src/assets/forest_sky.png');
    this.load.image("img_plateform", "src/assets/platform.png");
    this.load.image("img_etoile", "src/assets/star.png");
    this.load.image("img_bombe", "src/assets/bomb.png");
    this.load.spritesheet("img_perso", "src/assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48
    });
  }

  create() {
  this.add.image(400, 300, "forest_mountain");
  this.add.image(400, 300, "forest_back"); 
  this.add.image(400, 300, "forest_sky"); 
  this.add.image(400, 300, "forest_long");         
  this.add.image(400, 300, "forest_mid");        // arbres milieu
  this.add.image(400, 300, "forest_short");
  
  this.groupe_plateformes = this.physics.add.staticGroup();
    this.groupe_plateformes.create(200, 584, "img_plateform");
    this.groupe_plateformes.create(600, 584, "img_plateform");
    this.groupe_plateformes.create(150, 430, 'img_plateform'); // plateforme haute gauche
    this.groupe_plateformes.create(450, 320, 'img_plateform'); // plateforme milieu
    this.groupe_plateformes.create(700, 220, 'img_plateform');
    // ajout d'un texte distintcif  du niveau
     this.add.text(400, 50, "Niveau 2 — La Forêt", {
    fontFamily: 'Georgia, serif',
    fontSize: "22pt",
    fill: '#90EE90'  // vert clair
    });

    this.player = this.physics.add.sprite(100, 450, "img_perso");
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
    
    // Créer les animations
    this.anims.create({
      key: "anim_tourne_gauche",
      frames: this.anims.generateFrameNumbers("img_perso", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
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
    
    this.clavier = this.input.keyboard.createCursorKeys();
    this.boutonSuivant = this.input.keyboard.addKey('N');
    this.physics.add.collider(this.player, this.groupe_plateformes);
    
    // Créer les étoiles
    this.groupe_etoiles = this.physics.add.group();
    for (var i = 0; i < 10; i++) {
      var coordX = 70 + 70 * i;
      this.groupe_etoiles.create(coordX, 10, "img_etoile");
    }
    this.physics.add.collider(this.groupe_etoiles, this.groupe_plateformes);
    
    this.groupe_etoiles.children.iterate((etoile_i) => {
      var coef_rebond = Phaser.Math.FloatBetween(0.4, 0.8);
      etoile_i.setBounceY(coef_rebond);
    });
    
    this.physics.add.overlap(this.player, this.groupe_etoiles, (player, etoile) => this.ramasserEtoile(player, etoile), null, this);
    
    // Créer le texte du score
    this.zone_texte_score = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });
    this.zone_texte_score.setScrollFactor(0);
    
    // Créer les bombes
    this.groupe_bombes = this.physics.add.group();
    this.physics.add.collider(this.groupe_bombes, this.groupe_plateformes);
    this.physics.add.collider(this.player, this.groupe_bombes, (player, bombe) => this.chocAvecBombe(player, bombe), null, this);
  }

  update() {
    if (this.gameOver) {
      return;
    }
    
    if (this.clavier.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play("anim_tourne_gauche", true);
    } else if (this.clavier.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play("anim_tourne_droite", true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("anim_face");
    }
    if (this.clavier.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }
     if (this.clavier.space.isDown && this.player.body.blocked.down) {
    this.player.setVelocityY(-400);
  }
  if (Phaser.Input.Keyboard.JustDown(this.boutonSuivant) == true) {
      this.scene.start("niveau3");
  }
  }
  
  ramasserEtoile(player, etoile) {
    etoile.disableBody(true, true);
    if (this.groupe_etoiles.countActive(true) == 0) {
      this.groupe_etoiles.children.iterate((etoile_i) => {
        etoile_i.enableBody(true, etoile_i.x, 0, true, true);
      });
    }
    this.score += 10;
    this.zone_texte_score.setText("Score: " + this.score);

    var x;
    if (player.x < 400) {
      x = Phaser.Math.Between(400, 800);
    } else {
      x = Phaser.Math.Between(0, 400);
    }

    var une_bombe = this.groupe_bombes.create(x, 16, "img_bombe");
    une_bombe.setBounce(1);
    une_bombe.setCollideWorldBounds(true);
    une_bombe.setVelocity(Phaser.Math.Between(-200, 200), 20);
    une_bombe.allowGravity = false;
  }

  chocAvecBombe(player, bombe) {
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play("anim_face");
    this.gameOver = true;
  }
}