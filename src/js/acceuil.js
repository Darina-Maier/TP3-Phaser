export default class acceuil extends Phaser.Scene {
    constructor() {
        super({ key: "acceuil" });
    }

    preload() {
        this.load.image("acceuil_bouton", "src/assets/acceuil_bouton.png"); // remplace par un vrai bouton
    }

    create() {
        // Fond du menu
    this.cameras.main.setBackgroundColor('#000000');

    // Titre
    this.add.text(250, 150, "Mon Jeu Phaser", {
        fontSize: "36pt",
        fill: "#ffffff"
    });

        // Bouton play
        var bouton_play = this.add.image(400, 380, "acceuil_bouton");
        bouton_play.setInteractive(); // rend le bouton cliquable

        // Survol souris → agrandit le bouton
        bouton_play.on("pointerover", () => {
            bouton_play.setScale(1.2);
        });

        // Souris quitte → taille normale
        bouton_play.on("pointerout", () => {
            bouton_play.setScale(1);
        });

        // Clic → lance la scène Selection
        bouton_play.on("pointerup", () => {
            this.scene.start("Selection");
        });
    }
}