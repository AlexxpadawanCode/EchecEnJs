let selectedBox = null;
let currentPlayer = "white";
let lastMove = null; // Stocke les informations du dernier mouvement pour la prise en passant

let previousWhiteKingBox = null;
let previousBlackKingBox = null;

document.querySelectorAll(".box").forEach((box) => {
  box.addEventListener("click", () => {
    if (!selectedBox) {
      // Première sélection : choisir la pièce à déplacer
      if (box.querySelector("i")) {
        selectedBox = box; // Sélectionner la case
      }
    } else {
      // Deuxième sélection : choisir la destination
      movePiece(selectedBox, box);
      selectedBox = null; // Réinitialiser après le mouvement
    }
  });
});

function isSameColor(fromBox, toBox) {
  const fromPiece = fromBox.querySelector("i");
  const toPiece = toBox.querySelector("i");

  if (!fromPiece || !toPiece) {
    return false; // Si l'une des cases est vide, il n'y a pas de problème de couleur
  }

  const isFromWhite = fromPiece.classList.contains("fa-regular");
  const isToWhite = toPiece.classList.contains("fa-regular");

  return isFromWhite === isToWhite; // Retourne vrai si les pièces sont de la même couleur
}

function isClearPath(fromRow, fromCol, toRow, toCol, boxes) {
  if (fromRow === toRow) {
    // Déplacement horizontal
    const start = Math.min(fromCol, toCol);
    const end = Math.max(fromCol, toCol);

    for (let col = start + 1; col < end; col++) {
      if (boxes[fromRow * 8 + col].querySelector("i")) {
        return false; // Une pièce est sur le chemin
      }
    }
  } else if (fromCol === toCol) {
    // Déplacement vertical
    const start = Math.min(fromRow, toRow);
    const end = Math.max(fromRow, toRow);

    for (let row = start + 1; row < end; row++) {
      if (boxes[row * 8 + fromCol].querySelector("i")) {
        return false; // Une pièce est sur le chemin
      }
    }
  } else {
    return false; // Ce n'est ni un mouvement en ligne ni en colonne
  }

  return true; // Le chemin est dégagé
}

function isClearDiagonal(fromRow, fromCol, toRow, toCol, boxes) {
  const rowDirection = toRow > fromRow ? 1 : -1;
  const colDirection = toCol > fromCol ? 1 : -1;

  let currentRow = fromRow + rowDirection;
  let currentCol = fromCol + colDirection;

  while (currentRow !== toRow && currentCol !== toCol) {
    if (boxes[currentRow * 8 + currentCol].querySelector("i")) {
      return false; // Une pièce est sur le chemin
    }
    currentRow += rowDirection;
    currentCol += colDirection;
  }

  return true; // Le chemin est dégagé
}

function isKingInCheck(kingColor) {
  // Rechercher la position du roi
  const boxes = document.querySelectorAll(".box");
  let kingBox = null;

  boxes.forEach((box) => {
    const piece = box.querySelector("i");
    if (piece && piece.classList.contains("fa-chess-king")) {
      const isWhiteKing = piece.classList.contains("fa-regular");
      if (
        (kingColor === "white" && isWhiteKing) ||
        (kingColor === "black" && !isWhiteKing)
      ) {
        kingBox = box;
      }
    }
  });

  // Si on ne trouve pas de roi, retourner faux (devrait rarement arriver)
  if (!kingBox) return false;

  for (const box of boxes) {
    const piece = box.querySelector("i");
    if (!piece) continue;

    const isWhitePiece = piece.classList.contains("fa-regular");
    const isEnemyPiece =
      (kingColor === "white" && !isWhitePiece) ||
      (kingColor === "black" && isWhitePiece);

    if (isEnemyPiece && isValidMove(box, kingBox)) {
      return true; // Le roi est en échec
    }
  }

  return false; // Le roi n'est pas en échec
}

function resetKingColors() {

  // Réinitialiser la couleur de la case précédente du roi blanc, s'il y en a une
  if (previousWhiteKingBox) {
    previousWhiteKingBox.style.backgroundColor = ""; // Réinitialiser la couleur
  }

  // Réinitialiser la couleur de la case précédente du roi noir, s'il y en a une
  if (previousBlackKingBox) {
    previousBlackKingBox.style.backgroundColor = ""; // Réinitialiser la couleur
  }

  // Réinitialiser la couleur des cases actuelles des rois
  document.querySelectorAll(".box").forEach((box) => {
    const piece = box.querySelector("i");
    if (piece && piece.classList.contains("fa-chess-king")) {
      box.style.backgroundColor = ""; // Réinitialiser la couleur actuelle
    }
  });
}

function updateKingStatus() {
  // Réinitialiser les couleurs des rois avant la vérification
  resetKingColors();

  // Vérifier si le roi blanc ou noir est en échec
  const whiteInCheck = isKingInCheck("white");
  const blackInCheck = isKingInCheck("black");

  // Trouver la case du roi blanc
  const whiteKingBox = Array.from(document.querySelectorAll(".box")).find(
    (box) => {
      const piece = box.querySelector("i");
      return (
        piece &&
        piece.classList.contains("fa-chess-king") &&
        piece.classList.contains("fa-regular")
      );
    }
  );

  // Si le roi blanc est en échec, on met la case en rouge
  if (whiteInCheck && whiteKingBox) {
    whiteKingBox.style.backgroundColor = "red"; // Mettre la case du roi en rouge
    alert("Le roi blanc est en échec !");
  }

  // Mettre à jour la position précédente du roi blanc
  previousWhiteKingBox = whiteKingBox;

  // Trouver la case du roi noir
  const blackKingBox = Array.from(document.querySelectorAll(".box")).find(
    (box) => {
      const piece = box.querySelector("i");
      return (
        piece &&
        piece.classList.contains("fa-chess-king") &&
        piece.classList.contains("fa-solid")
      );
    }
  );

  // Si le roi noir est en échec, on met la case en rouge
  if (blackInCheck && blackKingBox) {
    blackKingBox.style.backgroundColor = "red"; // Mettre la case du roi en rouge
    alert("Le roi noir est en échec !");
  }

  // Mettre à jour la position précédente du roi noir
  previousBlackKingBox = blackKingBox;
}

function movePiece(fromBox, toBox) {
  if (isValidMove(fromBox, toBox)) {
    const movingPiece = fromBox.querySelector("i");

    // Vérifier s'il y a une pièce sur la case de destination
    const targetPiece = toBox.querySelector("i");
    if (targetPiece) {
      // Si une pièce ennemie est présente, elle est capturée
      toBox.removeChild(targetPiece);
    }

    // Déplacer la pièce sur la case cible
    toBox.appendChild(movingPiece);
    fromBox.innerHTML = ""; // Vider la case de départ

    // Mise à jour de la variable lastMove après chaque coup
    const fromIndex = Array.from(fromBox.parentNode.children).indexOf(fromBox);
    const toIndex = Array.from(toBox.parentNode.children).indexOf(toBox);
    const fromRow = Math.floor(fromIndex / 8);
    const fromCol = fromIndex % 8;
    const toRow = Math.floor(toIndex / 8);
    const toCol = toIndex % 8;

    // Définir la pièce déplacée
    const pieceType = movingPiece.classList.contains("fa-chess-pawn")
      ? "pawn"
      : null;

    lastMove = {
      piece: pieceType,
      fromRow,
      fromCol,
      toRow,
      toCol,
    };

    // Vérifier si le roi est en échec après le mouvement
    updateKingStatus();

    // Changer le tour du joueur
    currentPlayer = currentPlayer === "white" ? "black" : "white";
  } else {
    return false;
  }
}

function isValidMove(fromBox, toBox) {
  const fromPiece = fromBox.querySelector("i");

  // Si la case de départ est vide, le mouvement est invalide
  if (!fromPiece) {
    return false;
  }

  const pieceClasses = fromPiece.classList;
  const isWhitePiece = pieceClasses.contains("fa-regular");
  const isBlackPiece = pieceClasses.contains("fa-solid");

  // Vérifier si le joueur essaie de déplacer une pièce de la bonne couleur
  if (
    (currentPlayer === "white" && !isWhitePiece) ||
    (currentPlayer === "black" && !isBlackPiece)
  ) {
    return false; // Le joueur essaie de déplacer une pièce qui n'est pas la sienne
  }

  // Identifier les positions dans la grille
  const fromIndex = Array.from(fromBox.parentNode.children).indexOf(fromBox);
  const toIndex = Array.from(toBox.parentNode.children).indexOf(toBox);

  // Calculer les positions
  const fromRow = Math.floor(fromIndex / 8);
  const fromCol = fromIndex % 8;
  const toRow = Math.floor(toIndex / 8);
  const toCol = toIndex % 8;

  // Récupérer la pièce à déplacer
  const piece = fromBox.querySelector("i").classList;

  if (
    (piece.contains("fa-regular") && piece.contains("fa-chess-pawn")) ||
    (piece.contains("fa-solid") && piece.contains("fa-chess-pawn"))
  ) {
    return isValidPawnMove(fromRow, fromCol, toRow, toCol, fromBox, toBox);
  } else if (
    (piece.contains("fa-regular") && piece.contains("fa-chess-rook")) ||
    (piece.contains("fa-solid") && piece.contains("fa-chess-rook"))
  ) {
    return isValidRookMove(fromRow, fromCol, toRow, toCol, fromBox, toBox);
  } else if (
    (piece.contains("fa-regular") && piece.contains("fa-chess-knight")) ||
    (piece.contains("fa-solid") && piece.contains("fa-chess-knight"))
  ) {
    return isValidKnightMove(fromRow, fromCol, toRow, toCol, fromBox, toBox);
  } else if (
    (piece.contains("fa-regular") && piece.contains("fa-chess-bishop")) ||
    (piece.contains("fa-solid") && piece.contains("fa-chess-bishop"))
  ) {
    return isValidBishopMove(fromRow, fromCol, toRow, toCol, fromBox, toBox);
  } else if (
    (piece.contains("fa-regular") && piece.contains("fa-chess-queen")) ||
    (piece.contains("fa-solid") && piece.contains("fa-chess-queen"))
  ) {
    return isValidQueenMove(fromRow, fromCol, toRow, toCol, fromBox, toBox);
  } else if (
    (piece.contains("fa-regular") && piece.contains("fa-chess-king")) ||
    (piece.contains("fa-solid") && piece.contains("fa-chess-king"))
  ) {
    return isValidKingMove(fromRow, fromCol, toRow, toCol, fromBox, toBox);
  }

  return false; // Par défaut, le mouvement est invalide
}

function isValidPawnMove(fromRow, fromCol, toRow, toCol, fromBox, toBox) {
  const isWhite = fromBox.querySelector("i").classList.contains("fa-regular");
  const direction = isWhite ? -1 : 1; // Les pions blancs se déplacent vers le haut (direction = -1), les pions noirs vers le bas (direction = 1)

  // Déplacement d'une case vers l'avant
  if (
    toCol === fromCol &&
    toRow === fromRow + direction &&
    !toBox.querySelector("i")
  ) {
    return true;
  }

  // Déplacement initial de deux cases vers l'avant
  if (
    toCol === fromCol &&
    fromRow === (isWhite ? 6 : 1) &&
    toRow === fromRow + 2 * direction &&
    !toBox.querySelector("i")
  ) {
    const intermediateRow = fromRow + direction;
    const intermediateBox =
      fromBox.parentNode.children[intermediateRow * 8 + fromCol];
    if (!intermediateBox.querySelector("i")) {
      return true;
    }
  }

  // Capture en diagonale
  if (
    Math.abs(toCol - fromCol) === 1 &&
    toRow === fromRow + direction &&
    toBox.querySelector("i")
  ) {
    const targetPiece = toBox.querySelector("i").classList;
    // Vérifier que la pièce capturée est de l'autre couleur
    if (
      (isWhite && targetPiece.contains("fa-solid")) ||
      (!isWhite && targetPiece.contains("fa-regular"))
    ) {
      return true;
    }
  }

  // Prise en passant
  if (Math.abs(toCol - fromCol) === 1 && toRow === fromRow + direction) {
    // Vérifier que le dernier coup est un mouvement de deux cases d'un pion ennemi adjacent
    if (
      lastMove &&
      lastMove.piece === "pawn" &&
      Math.abs(lastMove.fromRow - lastMove.toRow) === 2
    ) {
      const lastMoveCol = lastMove.fromCol;
      const lastMoveRow = lastMove.toRow;

      // Vérifier si le pion se trouve juste à côté sur la même ligne et que la case derrière le pion capturé est vide
      if (
        lastMoveRow === fromRow &&
        lastMoveCol === toCol &&
        !toBox.querySelector("i")
      ) {
        // La case derrière la prise en passant est vide
        const capturedPawnBox =
          fromBox.parentNode.children[lastMove.toRow * 8 + lastMove.toCol];
        if (capturedPawnBox.querySelector("i")) {
          // Capturer le pion ennemi en passant
          capturedPawnBox.innerHTML = ""; // Retirer le pion capturé
          return true;
        }
      }
    }
  }

  // Si aucune condition n'est remplie, le mouvement est invalide
  return false;
}

function isValidRookMove(fromRow, fromCol, toRow, toCol, fromBox, toBox) {
  if (
    !isClearPath(fromRow, fromCol, toRow, toCol, fromBox.parentNode.children)
  ) {
    return false; // Il y a un obstacle sur le chemin
  }

  if (isSameColor(fromBox, toBox)) {
    return false; // Si la pièce à destination est de la même couleur, c'est invalide
  }

  return true; // Le mouvement est valide
}

function isValidKnightMove(fromRow, fromCol, toRow, toCol, fromBox, toBox) {
  // Calculer la différence de déplacement
  const rowDiff = Math.abs(toRow - fromRow);
  const colDiff = Math.abs(toCol - fromCol);

  // Vérifier que le mouvement correspond à un mouvement en "L"
  const isLShape =
    (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);

  if (!isLShape) {
    return false; // Si ce n'est pas un mouvement en "L", il est invalide
  }

  if (isSameColor(fromBox, toBox)) {
    return false; // Si la pièce à destination est de la même couleur, c'est invalide
  }

  // Si toutes les conditions sont remplies, le mouvement est valide
  return true;
}

function isValidBishopMove(fromRow, fromCol, toRow, toCol, fromBox, toBox) {
  const rowDiff = Math.abs(toRow - fromRow);
  const colDiff = Math.abs(toCol - fromCol);

  // Vérifier si le mouvement est bien en diagonale (différence égale entre les rangées et les colonnes)
  if (rowDiff !== colDiff) {
    return false; // Le mouvement n'est pas en diagonale
  }

  if (
    !isClearDiagonal(
      fromRow,
      fromCol,
      toRow,
      toCol,
      fromBox.parentNode.children
    )
  ) {
    return false; // Il y a un obstacle sur le chemin
  }

  if (isSameColor(fromBox, toBox)) {
    return false; // Si la pièce à destination est de la même couleur, c'est invalide
  }

  return true; // Le mouvement est valide
}

function isValidQueenMove(fromRow, fromCol, toRow, toCol, fromBox, toBox) {
  const rowDiff = Math.abs(toRow - fromRow);
  const colDiff = Math.abs(toCol - fromCol);

  if (fromRow === toRow || fromCol === toCol) {
    return isValidRookMove(fromRow, fromCol, toRow, toCol, fromBox, toBox);
  }

  if (rowDiff === colDiff) {
    return isValidBishopMove(fromRow, fromCol, toRow, toCol, fromBox, toBox);
  }

  return false; // Si ce n'est ni un mouvement en ligne ni en diagonale, c'est invalide
}

function isValidKingMove(fromRow, fromCol, toRow, toCol, fromBox, toBox) {
  const rowDiff = Math.abs(toRow - fromRow);
  const colDiff = Math.abs(toCol - fromCol);

  // Mouvement classique du roi d'une case dans n'importe quelle direction
  if (rowDiff <= 1 && colDiff <= 1) {
    // Vérifier si la case de destination contient une pièce de la même couleur
    if (isSameColor(fromBox, toBox)) {
      return false;
    }
    return true;
  }

  return false; // Si aucune condition n'est remplie, le mouvement est invalide
}
