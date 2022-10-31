module.exports = {
	parser: "@typescript-eslint/parser",
	extends: [
		"plugin:@typescript-eslint/recommended",
		"metarhia",
		"plugin:sonarjs/recommended",
		"airbnb-typescript/base",
		"prettier"
	],
	plugins: [
		"sonarjs"
	],
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module"
	},
	rules: {
		"no-console": "off",
		"import/prefer-default-export": 0,
		"semi": "error"
	},
	env: {
		node: true,
		es2022: true
	},
	root: true
}
