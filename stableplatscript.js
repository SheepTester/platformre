function checkAxis(movement, currentCoord, otherCoord, isSolid, setPosition, onCollision, onNoCollision) {
  const anchor = movement < 0 ? currentCoord : currentCoord + PLAYER_SIZE;
  let next = movement < 0 ? Math.floor(anchor + Number.EPSILON) : Math.ceil(anchor - Number.EPSILON);
  let collided = false;
  while (movement < 0 ? next - anchor >= movement : next - anchor <= movement) {
    const min = Math.floor(otherCoord);
    const max = Math.ceil(otherCoord + PLAYER_SIZE);
    const loc = movement < 0 ? next - 1 : next;
    let collision = false;
    for (let i = min; i < max; i++) if (isSolid(loc, i)) {
      collision = true;
      break;
    }
    if (collision) {
      setPosition(movement < 0 ? next : next - PLAYER_SIZE);
      if (onCollision) onCollision();
      collided = true;
      break;
    }
    movement < 0 ? next-- : next++;
  }
  if (!collided) {
    setPosition(currentCoord + movement);
    if (onNoCollision) onNoCollision();
  }
}
