module.exports = {
    "env": {
      "es6": true,
      "node": true
    },
    "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 8,
    "ecmaFeature": {
      "experimentalObjectRestSpread": true
    }
  },
    "rules": {
        "eqeqeq": "error",
      "no-trailing-spaces": "error",
      "object-curly-spacing": [
        "error", "always"
      ],
      "arrow-spacing": [
        "error", { "before": true, "after": true }
      ],
        "no-console" : "off",
        "indent": [
            "error",
            "spaces"
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "never"
        ]
    }
};
