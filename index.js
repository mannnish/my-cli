#!/usr/bin/env node
const inquirer = require('inquirer');
const fetch = require('node-fetch')
const cheerio = require('cheerio');
const { exec } = require('child_process');
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
		if (!config.todoist_key) {
			console.log(chalk.red('Authentication Error'));
			return false;
		}
		return await checkForKey(config.todoist_key);
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
		'Authorization': `Bearer ${config.todoist_key}`
	};
	const response = await fetch(url, { headers });
	const data = await response.json();
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
	exec(`google-chrome https://docs.google.com/spreadsheets/d/1ryH86xZ_m2zvuAw0dZqlMHQVJROPqX7p/edit#gid=866777697`)
}

function interviewFn() {
	const config = require('./config.json');
	const url = config.interview_prep
	exec(`google-chrome ${url}`)
}

const tasks = [
	{ title: '5 questions from DSA Sheet', function: dsaSheet },
	{ title: 'interview prep', function: interviewFn },
	// { title: 'todoist add task for today', function: addTask },
	// { title: 'update self-note', function: updateSelfNote }
];

(async () => {
	init({ clear: true });
	if (input.includes('config-set')) {
		let defTodoist, defAccess;
		try {
			const config = require('./config.json');
			defTodoist = config.todoist_key;
			defAccess = config.access_token;
		} catch (error) { }

		const key = await inquirer.prompt([
			{
				name: 'todoist_key',
				message: 'Enter your api key',
				type: 'input',
				default: defTodoist
			},
			{
				name: 'interview_prep',
				message: 'Enter your interview prep url',
				type: 'input',
				default: 'https://www.notion.so/Interview-based-81298d3f66824cfcbc56a205bf306f00#86c0f1889dbf4437a97b48321146162c'
			},
			{
				name: 'access_token',
				message: 'Enter your access token',
				type: 'input',
				default: defAccess
			},
		]);
		fs.writeFileSync(
			'./config.json',
			JSON.stringify(key)
		);
		if (await checkForKey(key.todoist_key)) console.log(chalk.greenBright('Authentication Successful'));
		else console.log(chalk.red('Authentication Error'));


	} else if (input.includes('config-remove')) {
		const existingConfig = fs.existsSync('./config.json');
		if (!existingConfig) console.log(chalk.red('No config'));
		else fs.unlinkSync('./config.json')


	} else if (input.includes('config-get')) {
		const existingConfig = fs.existsSync('./config.json');
		if (!existingConfig) console.log(chalk.red('No config'));
		else {
			const config = require('./config.json');
			console.log(config)
		}


	}
	else {
		const login = await authMiddleware();
		if (!login) return

		await fetchTodoistTaks();
		await fetchByteBlog();
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