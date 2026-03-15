// chargement des librairies

export default class niveau1 extends Phaser.Scene {
  // constructeur de la classe
  constructor() {
    super({
      key: "niveau1" //  ici on précise le nom de la classe en tant qu'identifiant
    });
  }
  preload() {
    this.load.image('fond_espace', 'src/assets/fond_espace.png');
    this.load.image("img_plateform", "src/assets/platform.png");
    this.load.spritesheet("img_perso", "src/assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48
    });
  }

  create() {
    this.add.image(400, 300, 'fond_espace');
    this.groupe_plateformes = this.physics.add.staticGroup();
    this.groupe_plateformes.create(200, 584, "img_plateform");
    this.groupe_plateformes.create(600, 584, "img_plateform");
    // ajout d'un texte distintcif  du niveau
    this.add.text(400, 100, "Vous êtes dans le niveau 1", {
      fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
      fontSize: "22pt"
    });

    this.player = this.physics.add.sprite(100, 450, "img_perso");
    this.player.refreshBody();
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
    this.clavier = this.input.keyboard.createCursorKeys();
    this.boutonSuivant = this.input.keyboard.addKey('N');
    this.physics.add.collider(this.player, this.groupe_plateformes);
  }

  update() {
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
      this.scene.start("niveau2");
  }
  }
}
 