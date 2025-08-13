import { useRef, useState, useEffect } from "react";
import "./App.css";

export default function App() {
  const canvasRef = useRef(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState(null);

  // Liste des personnes
  const people = [
    { nom: "Dupont", prenom: "Alice", couleur: "#e74c3c" },
    { nom: "Martin", prenom: "Bob", couleur: "#27ae60" },
    { nom: "Durand", prenom: "Charlie", couleur: "#2980b9" },
    { nom: "Lefevre", prenom: "Diane", couleur: "#f1c40f" },
    { nom: "Moreau", prenom: "Eve", couleur: "#8e44ad" },
    { nom: "", prenom: "Toto", couleur: "#62ad44ff" },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const containerWidth = canvas.parentElement.offsetWidth;
      let size;
      if (window.innerWidth > 650) {
        size = 600; // grand écran
      } else {
        size = Math.min(containerWidth, 325); // petit écran
      }
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");
      drawWheel(ctx, rotation);
    };

    updateSize(); // au premier affichage
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [rotation, people]);

  const segmentAngle = (2 * Math.PI) / people.length;

  // Dessiner la roue
  const drawWheel = (ctx, rotation) => {
    const size = ctx.canvas.width / 2;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    people.forEach((person, i) => {
      const startAngle = i * segmentAngle + rotation;
      const endAngle = startAngle + segmentAngle;

      ctx.beginPath();
      ctx.moveTo(size, size);
      ctx.arc(size, size, size, startAngle, endAngle);
      ctx.fillStyle = person.couleur;
      ctx.fill();
      ctx.stroke();

      // Texte
      ctx.save();
      ctx.translate(size, size);
      ctx.rotate(startAngle + segmentAngle / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#fff";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText(`${person.prenom} ${person.nom}`, size - 10, 5);
      ctx.restore();
    });

    // Flèche en haut
    ctx.beginPath();
    ctx.moveTo(size, 0);
    ctx.lineTo(size - 10, 20);
    ctx.lineTo(size + 10, 20);
    ctx.closePath();
    ctx.fillStyle = "#000";
    ctx.fill();
  };

  // Animation de rotation
  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setWinner(null);

    const spins = Math.floor(Math.random() * 5) + 5; // nombre de tours
    const finalRotation = Math.random() * 2 * Math.PI; // angle final
    const targetRotation = rotation + spins * 2 * Math.PI + finalRotation;

    let start = null;
    const duration = 4000;

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = (timestamp - start) / duration;
      const easedProgress = 1 - Math.pow(1 - progress, 3); // easing
      const currentRotation =
        rotation + easedProgress * (targetRotation - rotation);

      setRotation(currentRotation);
      drawWheel(canvasRef.current.getContext("2d"), currentRotation);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);

        // Angle du pointeur (la flèche en haut) = 12h = 3π/2
        const pointerAngle = (3 * Math.PI) / 2;

        // On normalise l’angle courant par rapport au pointeur
        const normalized =
          (pointerAngle - (currentRotation % (2 * Math.PI)) + 2 * Math.PI) %
          (2 * Math.PI);

        // L’index du segment pointé par la flèche
        const winningIndex =
          Math.floor(normalized / segmentAngle) % people.length;

        setWinner(people[winningIndex]);
      }
    };

    requestAnimationFrame(animate);
  };

  // Dessin initial
  const initDraw = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      drawWheel(ctx, rotation);
    }
  };

  return (
    <div className="app">
      <h1>🎯 Roue de la Fortune</h1>
      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        style={{ borderRadius: "50%", border: "2px solid black" }}
      />
      {initDraw()}
      <button onClick={spinWheel} disabled={isSpinning}>
        {isSpinning ? "⏳ En cours..." : "🎡 Lancer la roue"}
      </button>
      <div className="winner">
        {winner ? (
          <>
            🎉 Gagnant :{" "}
            <b>
              {winner.prenom} {winner.nom}
            </b>
          </>
        ) : (
          <span>&nbsp;</span> // espace vide pour garder la hauteur
        )}
      </div>
    </div>
  );
}
