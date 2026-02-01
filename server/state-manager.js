function createRoom() {
  return {
    strokes: [],

    undo(userId) {
      for (let i = this.strokes.length - 1; i >= 0; i--) {
        if (this.strokes[i].userId === userId) {
          return this.strokes.splice(i, 1)[0];
        }
      }
      return null;
    }
  };
}

module.exports = { createRoom };
