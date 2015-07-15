var colorGen = require('tinytinycolor');
var _ = require('lodash');

class Color {
  constructor(stringOrColor) {
    this._color = new colorGen(stringOrColor);
  }

  toString(): string {
    return this._color.toHexString();
  }

  lighten(amount: number): Color {
    return new Color(colorGen.lighten(this._color, amount));
  }
}

module.exports = Color;
