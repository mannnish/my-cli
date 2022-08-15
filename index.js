#!/usr/bin/env node

/**
 * my-cli
 * this is test
 *
 * @author mannnish <https://mannnish.vercel.app>
 */

const init = require('./utils/init');
const cli = require('./utils/cli');
const log = require('./utils/log');
const inquirer = require('inquirer');
const chalk = require('chalk')

const input = cli.input;
const flags = cli.flags;
const { clear, debug } = flags;

const tasks = [
	{
		"title": "5 questions from DSA Sheet",
		"function": dsaSheet
	},
	{
		"title": "any zattire work if left by chance",
		"function": zattireFn,
	},
	{
		"title": "interview prep",
		"function": zattireFn,
	},
	{
		"title": "gym",
		"function": gymFn
	}
];


(async () => {
	init({ clear });
	debug && log(flags);

	console.log(chalk.bgBlue(' tasks: '));
	tasks.forEach((element, index) => {
		console.log(`${index + 1}. ${element.title}`);
	});
	console.log('\n');
	const option = await inquirer.prompt({
		name: 'task_number',
		type: 'input',
		message: 'Which task do you want to do?'
	})
	console.log(`\n${chalk.bgGreenBright(` processing `)} : ${tasks[option.task_number - 1].title}\n`);
	console.log(tasks[option.task_number - 1].function());
	process.exit(0);
})();

function dsaSheet() {
	const max = 479;
	const min = 4;
	let list = [];
	// for loop 1 to 5
	for (let i = 0; i < 5; i++) {
		list.push(Math.floor(Math.random() * (max - min) + min))
	}
	return list;
}

function gymFn() {
	return "happy gym"
}

function zattireFn() {
	return "happy zattire"
}
