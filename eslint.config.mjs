import config from "eslint-config-standard";


export default [
  {rules:
    {
      "sort-imports": "on",
      "no-duplicate-imports": "on",
    }
  },
  ...[].concat(config),
];