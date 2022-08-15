#!/usr/bin/env node
const inquirer = require('inquirer');
const fetch = require('node-fetch')
const cheerio = require('cheerio');
const fs = require('fs');
const init = require('./utils/init');
const cli = require('./utils/cli');
const chalk = require('chalk');
const input = cli.input;

authMiddleware = async () => {
	const existingConfig = fs.existsSync('./config.json');
	if (!existingConfig) {
		console.log(chalk.red('Authentication Error'));
		return false;
	} else {
		const config = require('./config.json');
		if (!config.key) {
			console.log(chalk.red('Authentication Error'));
			return false;
		}
		return await checkForKey(config.key);
	}
};

checkForKey = async (token) => {
	const url = `https://api.todoist.com/rest/v1/labels`;
	const headers = { 'Authorization': `Bearer ${token}` };
	const response = await fetch(url, { headers });
	if (response.status == 200) return true;
	else return false;
}

fetchByteBlog = async () => {
	console.log(chalk.bgYellow('tech-blog  : '));
	const response = await fetch('https://blog.bytebytego.com/');
	const body = await response.text();
	const $ = cheerio.load(body);

	let title, description;
	$('.home-big-post a.post-preview-title').each((i, data) => {
		const titleNode = $(data);
		title = titleNode.text();
	});
	$('.home-big-post a.post-preview-description').each((i, data) => {
		const titleNode = $(data);
		description = titleNode.text();
	});
	console.log(title);
	console.log(chalk.grey(description));
	console.log('\n')
}

fetchTodoistTaks = async () => {
	console.log(chalk.bgRedBright('todoist tasks : '));
	const config = require('./config.json');
	const query = `?filter=today`
	const url = `https://api.todoist.com/rest/v1/tasks/${query}`;
	const headers = {
		'Authorization': `Bearer ${config.key}`
	};
	const response = await fetch(url, { headers });
	const data = await response.json();
	let list = [];
	data.forEach(item => {
		console.log(item.content);
	})
	console.log('\n');
}

function dsaSheet() {
	const max = 479;
	const min = 4;
	let list = [];
	for (let i = 0; i < 5; i++) {
		list.push(Math.floor(Math.random() * (max - min) + min));
	}
	console.log(list);
}

function zattireFn() {
	console.log('happy zattire');
}

const tasks = [
	{ title: '5 questions from DSA Sheet', function: dsaSheet },
	{ title: 'interview prep', function: zattireFn },
	{ title: 'todoist add task for today', function: addTask },
	{ title: 'update self-note', function: updateSelfNote }
];

(async () => {
	init({ clear: true });
	if (input.includes('config')) {
		const key = await inquirer.prompt({
			name: 'key',
			message: 'Enter your api key',
			type: 'input'
		});
		fs.writeFileSync(
			'./config.json',
			JSON.stringify({ key: key.key })
		);
		if (await checkForKey(key.key)) console.log(chalk.greenBright('Authentication Successful'));
		else console.log(chalk.red('Authentication Error'));


	} else if (input.includes('logout')) {
		const existingConfig = fs.existsSync('./config.json');
		if (!existingConfig) console.log(chalk.red('No config'));
		else fs.unlinkSync('./config.json')


	} else {
		// const login = await authMiddleware();
		// if (!login) return

		// await fetchTodoistTaks();
		// await fetchByteBlog();
		const input = await inquirer.prompt({
			type: 'list',
			name: 'task',
			message: 'Select a task',
			choices: tasks.map(task => task.title)
		})
		console.log(input.task);
		const selectedTask = tasks.find(task => task.title === input.task);
		selectedTask.function();
	}
	process.exit(0);
})();