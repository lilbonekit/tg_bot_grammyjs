import dotenv from 'dotenv'
import {
	Bot,
	Context,
	GrammyError,
	HttpError,
	Keyboard,
	InlineKeyboard,
} from 'grammy'
import { hydrate, HydrateFlavor } from '@grammyjs/hydrate'

const badWords = [
	'хуй',
	'жопа',
	'пизд',
	'еба',
	'мудил',
	'гандон',
	'пидор',
	'бляд',
	'сука',
	'нахуй',
	'залуп',
	'чмо',
	'уеб',
	'долбо',
	'еблан',
	'ебат',
	'хуесос',
	'пидр',
	'говно',
	'педераст',
	'выблядок',
	'ебуч',
	'пердун',
	'шлюх',
	'бля',
]

const badWordsRegex = new RegExp(badWords.join('|'), 'i')

dotenv.config()

type BotContext = HydrateFlavor<Context>

const bot = new Bot<BotContext>(process.env.BOT_API_KEY as string)
bot.use(hydrate())

bot.api.setMyCommands([
	{
		command: 'start',
		description: 'Запуск бота',
	},
	{
		command: 'say_anekdot',
		description: 'Рассказать анекдот про Подол',
	},
	{
		command: 'menu',
		description: 'Интерактивное меню',
	},
	{
		command: 'mood',
		description: 'Спросить как у вас дела',
	},
	{
		command: 'share',
		description: 'Чем-нибудь поделиться',
	},
	{
		command: 'inline_keyboard',
		description: 'Инлайн клавиатура',
	},
])

// From slash without "/"
bot.command('start', async (ctx) => {
	await ctx.react('💩')
	await ctx.reply(
		'Здарова педик. Я бот тг канала <span class="tg-spoiler"><a href="https://t.me/lilbonekit_bot">lilbonekit\'s bot</a></span>',
		{
			parse_mode: 'HTML',
			reply_parameters: { message_id: ctx.msg.message_id },
		}
	)
})

const menuKeyboard = new InlineKeyboard()
	.text('Узнать статус заказа', 'order-status')
	.text('Обратиться в поддержку', 'support')

const backKeyboard = new InlineKeyboard().text('<= Назад в меню', 'back')

bot.command('menu', async (ctx) => {
	await ctx.reply('Выберите пункт меню', {
		reply_markup: menuKeyboard,
	})
})

bot.callbackQuery('order-status', async (ctx) => {
	await ctx.callbackQuery.message?.editText('Заказ в пути', {
		reply_markup: backKeyboard,
	})
	await ctx.answerCallbackQuery()
})

bot.callbackQuery('support', async (ctx) => {
	await ctx.callbackQuery.message?.editText('Напишите Ваш запрос', {
		reply_markup: backKeyboard,
	})
	await ctx.answerCallbackQuery()
})

bot.callbackQuery('back', async (ctx) => {
	await ctx.callbackQuery.message?.editText('Выберите пункт меню', {
		reply_markup: menuKeyboard,
	})
	await ctx.answerCallbackQuery()
})

bot.command('inline_keyboard', async (ctx) => {
	const inlineKeyboard = new InlineKeyboard()
		.text('1', 'button-1')
		.row()
		.text('2', 'button-2')
		.row()
		.text('3', 'button-3')
		.row()

	const inlineKeyboard2 = new InlineKeyboard().url(
		'Перейти в тг к Lilbonekit',
		'https://t.me/lilbonekit'
	)

	await ctx.reply('Нажмите кнопку', {
		reply_markup: inlineKeyboard2,
	})
})

// 	// await ctx.reply('Выбери цифру', {
// 	// 	reply_markup: inlineKeyboard,
// 	// })
// })

// bot.callbackQuery(/button-[1-3]/, async (ctx) => {
// 	await ctx.answerCallbackQuery('Вы выбрали цифру!!!')
// 	await ctx.reply(
// 		`Вы выбрали цифру: ${ctx.callbackQuery.data.replace(/\D/g, '')}`
// 	)
// })

// bot.on('callback_query:data', async (ctx) => {
// 	await ctx.answerCallbackQuery('Вы выбрали цифру!!!')
// 	await ctx.reply(
// 		`Вы выбрали цифру ${ctx.callbackQuery.data.replace(/\D/g, '')}`
// 	)
// })

bot.command('share', async (ctx) => {
	const shareKeyboard = new Keyboard()
		.requestLocation('Геолокация')
		.requestContact('Контакт')
		.requestPoll('Опрос')
		.resized()
		.placeholder('Ты сейчас будешь чем-то делиться...')

	await ctx.reply('Чем хочешь поделиться?', {
		reply_markup: shareKeyboard,
	})
})

bot.on(':location', async (ctx) => {
	await ctx.reply('Спасибо, ТЦК заедут к тебе скоро')
})

bot.command('mood', async (ctx) => {
	const moodKeyBoard = new Keyboard()
		.text('Хорошо')
		.row()
		.text('Норм')
		.row()
		.text('Хуево')
		.resized()

	await ctx.reply('Как настроение?', {
		reply_markup: moodKeyBoard,
	})
})

bot.hears('Хорошо', async (ctx) => {
	await ctx.reply(`Ну и ладно. С ${ctx.from?.username} 200грн`, {
		reply_markup: { remove_keyboard: true },
	})
})

bot.command(['say_anekdot', 'hello'], async (ctx) => {
	await ctx.reply(`
– Знаешь как говорят у нас на Подоле...
– Не знаю. Я с Донбасса.
    `)
})

bot.hears('пинг', async (ctx) => {
	await ctx.reply('понг')
})

bot.hears(badWordsRegex, async (ctx) => {
	await ctx.reply('Эй, давай без матов 😡')
})

// filters: message:text - any text message only
// filters: message:photo - any photo message only
// filters: message:voice - any voice message only
// filters: message:entities:url - message with url

// bot.on('msg').filter(
// 	(ctx) => {
// 		return ctx?.from?.id === 506807217
// 	},
// 	async (ctx) => {
// 		await ctx.reply('Привет админ')
// 	}
// )
bot.hears('ID', async (ctx) => {
	await ctx.reply(`Твой id: ${ctx.from?.id}`)
})

bot.on(':photo').on('::hashtag', async (ctx) => {
	await ctx.reply('Ахахахаха хештег и еще и фото')
})

bot.on('::bold', async (ctx) => {
	await ctx.reply('Не надо повышать на меня шрифт')
})

bot.on(':entities:url', async (ctx) => {
	await ctx.reply('Что в ссылке?')
})

bot.on(':voice', async (ctx) => {
	await ctx.reply('Я не умею слушать голосовые')
})

bot.on('message', async (ctx) => {
	console.log(ctx.msg)
	console.log(ctx.from)
	console.log(ctx.me)
	await ctx.reply(
		'Надо подумать...Как насчет 15800грн и половину к-ки за э-гию пока не змн э-счетчики'
	)
})

bot.catch((error) => {
	const ctx = error.ctx
	console.error(`Error while handling update: ${ctx.update.update_id}`)
	const e = error.error

	if (e instanceof GrammyError) {
		console.error('Error in request:', e.description)
		return
	}

	if (e instanceof HttpError) {
		console.error('Could not contact Telegram', e)
		return
	}

	console.error('Unknown error', e)
})

// Order matters:
// All event listeners and error handlers must be set up
// before starting the bot
bot.start()
