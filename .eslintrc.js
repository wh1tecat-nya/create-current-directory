const path = require("path");
module.exports = {
	parser: "@typescript-eslint/parser",
	plugins: [
		"@typescript-eslint"
	],
	env: {
		node: true
	},
	extends: [
		"eslint:recommended",
		"prettier",
		"plugin:prettier/recommended",
		"prettier/@typescript-eslint"
	],
	parserOptions: {
		"warnOnUnsupportedTypeScriptVersion": false,
		"sourceType": "module",
		"ecmaVersion": 6
	},
	rules: {
		"no-console": "warn",
		"no-unused-vars": "off",
	},
};
