import {
	Component,
	For,
	Show,
	createEffect,
	createSignal,
	onCleanup,
	onMount,
} from 'solid-js';
import { Portal } from 'solid-js/web';

const TICK_RATE_MS = 150;
const COLS_NUM = 30;
const ROWS_NUM = 30;

const App: Component = () => {
	const [gameOver, setGameOver] = createSignal(false);

	const [score, setScore] = createSignal(0);
	const [highestScore, setHighestScore] = createSignal(
		Number(localStorage.getItem('highestScore')) || 0
	);

	const [speed, setSpeed] = createSignal({ x: 0, y: 0 });
	const [snake, setSnake] = createSignal([
		{
			x: getRandomInt(1, COLS_NUM),
			y: getRandomInt(1, ROWS_NUM),
		},
	]);
	const [food, setFood] = createSignal({
		x: getRandomInt(1, COLS_NUM),
		y: getRandomInt(1, ROWS_NUM),
	});

	const [isPaused, setIsPaused] = createSignal(false);

	const changeDirection = (e: KeyboardEvent) => {
		if (e.key === 'ArrowUp' && speed().y !== 1) setSpeed({ x: 0, y: -1 });
		else if (e.key === 'ArrowDown' && speed().y !== -1)
			setSpeed({ x: 0, y: 1 });
		else if (e.key === 'ArrowLeft' && speed().x !== 1)
			setSpeed({ x: -1, y: 0 });
		else if (e.key === 'ArrowRight' && speed().x !== -1)
			setSpeed({ x: 1, y: 0 });
	};

	const changeDirectionUp = () => {
		if (speed().y !== 1) setSpeed({ x: 0, y: -1 });
	};
	const changeDirectionDown = () => {
		if (speed().y !== -1) setSpeed({ x: 0, y: 1 });
	};
	const changeDirectionLeft = () => {
		if (speed().x !== 1) setSpeed({ x: -1, y: 0 });
	};
	const changeDirectionRight = () => {
		if (speed().x !== -1) setSpeed({ x: 1, y: 0 });
	};

	const changeFoodPosition = () => {
		const x = getRandomInt(1, COLS_NUM);
		const y = getRandomInt(1, ROWS_NUM);
		setFood({ x, y });
	};

	const handleRestartGame = () => {
		setGameOver(false);
		setSnake([{ x: getRandomInt(1, COLS_NUM), y: getRandomInt(1, ROWS_NUM) }]);
		setFood({ x: getRandomInt(1, COLS_NUM), y: getRandomInt(1, ROWS_NUM) });
		setSpeed({ x: 0, y: 0 });
		setScore(0);
	};

	//game logic
	createEffect(() =>
		setInterval(() => {
			if (gameOver() || isPaused()) return;
			//snake ate food
			if (snake()[0].x === food().x && snake()[0].y === food().y) {
				setSnake([
					{
						x: food().x,
						y: food().y,
					},
					...snake(),
				]);
				changeFoodPosition();
				setScore(score() + 1);
				if (score() > highestScore()) setHighestScore(score());
			}

			const snakeHeadX = snake()[0].x + speed().x;
			const snakeHeadY = snake()[0].y + speed().y;

			//snake hit a wall
			if (
				snakeHeadX < 1 ||
				snakeHeadX > COLS_NUM ||
				snakeHeadY < 1 ||
				snakeHeadY > ROWS_NUM
			) {
				setGameOver(true);
				return;
			}

			//if snake ate itself
			if (snake().length > 1) {
				snake().forEach((snakeSegment, index) => {
					if (index === 0) return;
					if (snakeSegment.x === snakeHeadX && snakeSegment.y === snakeHeadY) {
						setGameOver(true);
						return;
					}
				});
			}

			//update snake position
			setSnake([
				{
					x: snakeHeadX,
					y: snakeHeadY,
				},
				//slice snake last element to remove the tail
				...snake().slice(0, -1),
			]);
		}, TICK_RATE_MS)
	);

	createEffect(() => {
		localStorage.setItem('highestScore', highestScore().toString());
	});

	const pauseGame = () => setIsPaused(true);
	const resumeGame = () => setIsPaused(false);

	onMount(() => {
		document.addEventListener('keyup', changeDirection);
		window.addEventListener('focus', resumeGame);
		window.addEventListener('blur', pauseGame);

		onCleanup(() => {
			document.removeEventListener('keyup', changeDirection);
			window.removeEventListener('focus', resumeGame);
			window.removeEventListener('blur', pauseGame);
		});
	});

	return (
		<main class='h-screen w-screen grid place-items-center text-gray-300 bg-slate-950'>
			<div class='w-[100vw] md:w-[calc(100vh-20px)] rounded flex flex-col overflow-hidden'>
				<div class='bg-slate-800 h-20 flex px-5 items-center justify-between text-xl font-semibold relative'>
					<h1 class='max-md:hidden'>Score: {score()}</h1>
					<img
						src='src/favicon.ico'
						alt='logo'
						class='absolute translate-x-1/2 translate-y-1/2 bottom-1/2 right-1/2'
					/>
					<h1 class='max-md:hidden'>highest Score: {highestScore()}</h1>
				</div>
				<div class='bg-slate-900 h-[100vw] md:h-[calc(100vh-80px-20px)] grid grid-cols-[repeat(30,1fr)] grid-rows-[repeat(30,1fr)]'>
					<div
						style={{ 'grid-area': `${food().y} / ${food().x}` }}
						class='bg-green-700 rounded-full'
					/>
					<For each={snake()}>
						{(snakeSegment) => (
							<div
								style={{ 'grid-area': `${snakeSegment.y} / ${snakeSegment.x}` }}
								class='bg-orange-700'
							/>
						)}
					</For>
				</div>
				<div class='bg-slate-800 h-14 grid grid-cols-4 md:hidden'>
					<button onClick={changeDirectionUp} class='border-r border-gray-400'>
						Up
					</button>
					<button
						onClick={changeDirectionDown}
						class='border-r border-gray-400'
					>
						Down
					</button>
					<button
						onClick={changeDirectionLeft}
						class='border-r border-gray-400'
					>
						Left
					</button>
					<button onClick={changeDirectionRight} class=''>
						Right
					</button>
				</div>
			</div>

			<Show when={gameOver()}>
				<Portal>
					<div class='z-10 bg-black/75 w-screen h-screen absolute top-0 left-0' />
					<div class='z-20 rounded bg-slate-800 p-5 opacity-100 text-gray-300 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 space-y-4'>
						<h1 class='text-2xl font-semibold'>Game Over</h1>
						<button
							onClick={handleRestartGame}
							class='py-2 font-semibold bg-rose-600 rounded w-full text-lg'
						>
							Restart
						</button>
					</div>
				</Portal>
			</Show>
			<Show when={isPaused() && !gameOver()}>
				<Portal>
					<div class='z-10 bg-black/75 w-screen h-screen absolute top-0 left-0' />
					<div class='z-20 rounded bg-slate-800 p-5 opacity-100 text-gray-300 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 space-y-4'>
						<h1 class='text-2xl font-bold text-center'>Game Paused</h1>
						<h1 class='text-xl font-semibold'>
							Click or touch the window to continue
						</h1>
					</div>
				</Portal>
			</Show>
		</main>
	);
};

function getRandomInt(max: number, min = 0) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default App;
